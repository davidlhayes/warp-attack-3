  var Firebase = require("firebase");
  var boardUrl = 'https://warp-attack-3.firebaseIO.com/board';
  var tokensRef = new Firebase(boardUrl);

  module.exports = {
  // Check to see if a move to set a token pre-game is legal
  // if angular can't prevent moving the other player's Token
  // add a check on whose turn and check against token to move
    checkMove: function(org,dst) {
      var step;
      var incr;
      var spc;
      var maxBnd;
      var minBnd;
      //
      // check valid data
      //
      console.log('checkmove:' + org.row,org.col,org.color,org.rank,dst.row,dst.col,dst.color,dst.rank);
      if ((org.row == dst.row) && (org.col == dst.col)) return 'same square';
      // can't move onto a star
      if ((dst.rank == 'star')) return 'forbidden';
      // make sure token to move is a player token and not a flag or mine
      if ((org.rank == 'empty') || (org.rank == 'mine') ||
          (org.rank == 'flag') || (org.rank == 'star')) return 'immovable';
      // make sure all coordinates are on the playing field
      if ((org.row < 1) || (org.row > 10) || (org.col < 1) || (org.col > 10)) {
        return 'mover out of bounds';
      }
      if ((dst.row < 1) || (dst.row > 10) || (dst.col < 1) || (dst.col > 10)) {
        return 'destination out of bounds';
      }
      //
      // check for move capability
      //
      // rank 9 is uniquely allowed to move any number of unobstructed spaces in
      // its current column or its current row
      // that means we have to check for obstructions and make sure its a column
      // move OR a row move
      if (org.rank=='9') {
        spc = 9;
      } else {
        spc = 1;
      }
      if ((org.row != dst.row) && (org.col != dst.col)) {
        return 'illegal diagonal move';
      }
      if ((Math.abs(org.row-dst.row) > spc) || (Math.abs(org.col-dst.col) > spc)) {
        return 'too many space to move';
      }
      // check for obstructions if this is long trip
      if (spc > 1) {
        // column move
        console.log('same row ' + org.row,dst.row);
        if (org.row != dst.row) {
          if (Math.abs(dst.row-org.row) > 1) {
            if (dst.row > org.row) {
              maxBnd = parseInt(dst.row);
              minBnd = parseInt(org.row);
            } else {
              maxBnd = parseInt(org.row);
              minBnd = parseInt(dst.row);
            }
            // query the database for a non-empty cell in the patch
            tokensRef.on("value", function(snapshot) {
              snapshot.forEach(function(childSnapshot) {
                if (childSnapshot.val().col==org.col&&
                  childSnapshot.val().row>minBnd && childSnapshot.val().row<maxBnd) {
                    if (childSnapshot.val().rank != 'empty') return 'move is blocked';
                }
              });
            });
            }
          }
          // row move
        } else if (org.col != dst.col) {
          if (Math.abs(dst.col-org.col) > 1) {
            if (dst.col > org.col) {
              maxBnd = dst.col;
              minBnd = org.col;
            } else {
              maxBnd = org.col;
              minBnd = dst.col;
            }
            // query the database for a non-empty cell in the patch
            tokensRef.on("value", function(snapshot) {
              snapshot.forEach(function(childSnapshot) {
                if (childSnapshot.val().row==org.row&&
                  childSnapshot.val().col>minBnd && childSnapshot.val().col<maxBnd) {
                    if (childSnapshot.val().rank != 'empty') return 'move is blocked';
                }
              });
            });
          }
        } // if not returned yet, that means move is allowed

      // check if empty destination
      if (dst.rank == 'empty') return 'move to empty space';
      // BATTLE!!!
      // Special cases first
      // Spy beats Rank 1
      if ((org.rank == '1') && (dst.rank == 'spy')) return 'defeat';
      if ((org.rank == 'spy') && (dst.rank == '1')) return 'victory';
      // Mine beats anything but rank 8 (mine can only be at destination)
      if (dst.rank == 'mine') {
        if (org.rank != '8') {
          return 'defeat';
        } else {
          return 'victory';
        }
      }
      // check for flag
      if (dst.rank == 'flag') return 'win';
      // if you got this far, we're just comparing rank. Low beats high, but
      // equal rank takes out both
      if (org.rank == dst.rank) return 'double defeat';
      // and...finally, low rank wins
      if (org.rank < dst.rank) {
        return 'victory';
      } else {
        return 'defeat';
      }

    } // end checkMove

  }
