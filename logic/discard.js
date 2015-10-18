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
      var queryRef = tokensRef.orderByChild('row').startAt(lo).endAt(hi);
      queryRef.once("value", function(snapshot) {
        for (var key in snapshot) {
          if ((snapshot.val()[key].col == 'empty') && !found) {
            tokensRef.child(snapshot.val()[key]._id).update({ color: color, rank: rank });
            found = true;
          } // check for empty
        } // for loop
      }); // snapshot
    } // end function
  }
