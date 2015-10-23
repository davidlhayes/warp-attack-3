  var Firebase = require("firebase");
  var tokensRef = new Firebase('https://warp-attack-3.firebaseIO.com/board');

  module.exports = {

    // Replace enemy tokens with a blank piece (the backside) so that
    // each player only sees their own tokens.
    discard: function(color,rank) {
      var lo;
      var hi;
      var found = false;

      if (color=='blue') {
        lo = 11;
        hi = 14;
      } else {
        lo = 15;
        hi = 18;
      }
      tokensRef.once("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          console.log(childSnapshot.key(),childSnapshot.val().row,childSnapshot.val().col,childSnapshot.val().col,childSnapshot.val().rank);
          if ((parseInt(childSnapshot.val().row) >= lo && parseInt(childSnapshot.val().row) <= hi
                && childSnapshot.val().rank=='empty') && !found) {
            tokensRef.child(childSnapshot.key()).update({ color: color, rank: rank });
            found = true;
          } // check for empty
        }); // for loop
      }); // snapshot
    } // end function
  }
