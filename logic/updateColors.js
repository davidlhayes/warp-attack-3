  var Firebase = require("firebase");
  var tokensRef = new Firebase('https://warp-attack-3.firebaseIO.com/board');
  var tokRedRef = new Firebase('https://warp-attack-3.firebaseIO.com/red');
  var tokBlueRef = new Firebase('https://warp-attack-3.firebaseIO.com/blue');
  var turnRef = new Firebase('https://warp-attack-3.firebaseIO.com/turn');
  var playersRef = new Firebase('https://warp-attack-3.firebaseIO.com/players');

  module.exports = {

    updateColors : function(changedCell) {
      // console.log('Entering updateColors');changedCell
     var cell;
      // console.log("The updated cell, " + changedCell.row + ":" + changedCell.col
      //  + " is now " + changedCell.color + "/" + changedCell.rank);
      // convert main board
      // leave stars alone
      if (!((changedCell.row==5 && (changedCell.col==3 || changedCell.col==7))
       || (changedCell.row==5 && (changedCell.col==4 || changedCell.col==8))
       || (changedCell.row==6 && (changedCell.col==3 || changedCell.col==7))
       || (changedCell.row==6 && (changedCell.col==4 || changedCell.col==8)))) {
    //
    //  console.log('changedCell.row ' + typeof(changedCell.row));

    // convert board info and update red

      var queryRef = tokRedRef.orderByChild('row').startAt(changedCell.row).endAt(changedCell.row);
      queryRef.once("value", function(snapshot) {
        // the following finds the cell in question and picks out the elements
        // console.log('updateColors ' + changedCell.row, changedCell.col);
        for (var key in snapshot.val()) {
          // console.log('Red snapshot ' + snapshot.val()[key].col);
          if (snapshot.val()[key].col == changedCell.col) {
            // console.log('update these colors');
            if (changedCell.color=='blue') {
              color = 'blue';
              rank = 'k'
            } else {
              color = changedCell.color;
              rank = changedCell.rank;
            }
            // console.log('update ' + changedCell.row, changedCell.col, key,color,rank)
            tokRedRef.child(key).update({color: color, rank: rank});
          }
        }
        });

    // translate board coordinates and update blue (leave tray alone)
    //
        if (changedCell.row < 11) {
          var blueRow = 11 - changedCell.row;
          var blueCol = 11 - changedCell.col;
        } else {
          var blueRow = changedCell.row;
          var blueCol = changedCell.col;
        }
        var queryRef = tokBlueRef.orderByChild('row').startAt(blueRow.toString()).endAt(blueRow.toString());
        queryRef.once("value", function(snapshot) {
        // the following finds the cell in question and picks out the elements
        // console.log('blue ' + blueRow, blueCol);
        for (var key in snapshot.val()) {
          // console.log('Blue snapshot ' + snapshot.val()[key].col);
          if (snapshot.val()[key].col == blueCol) {
            if (changedCell.color=='red') {
              color = 'red';
              rank = 'k';
            } else {
              color = changedCell.color;
              rank =  changedCell.rank;
            }
            tokBlueRef.child(key).update({color: color, rank: rank});
          }
        }
      });
      }
    }

  }
