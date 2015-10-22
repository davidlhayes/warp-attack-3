  var express = require('express');
  var controller = express.Router();

  var Firebase = require("firebase");
  var bodyParser = require('body-parser');
  var transform = require('../logic/transform');
  var hideTokens = require('../logic/hideTokens');
  var checkSet = require('../logic/checkSet');
  var checkMove = require('../logic/checkMove');
  var discard = require('../logic/discard');
  var updateColors = require('../logic/updateColors');

  var boardUrl = 'https://warp-attack-3.firebaseIO.com/board';
  var tokensRef = new Firebase(boardUrl);
  var tokRedRef = new Firebase('https://warp-attack-3.firebaseIO.com/red');
  var tokBlueRef = new Firebase('https://warp-attack-3.firebaseIO.com/blue');
  var turnRef = new Firebase('https://warp-attack-3.firebaseIO.com/turn');
  var playersRef = new Firebase('https://warp-attack-3.firebaseIO.com/players');

  var isSetup;
  var cnt = 0;

  // Board API -- set board tokens, move tokens (as governed by game rules)
 //  and get token placement information
 //
 // if turn is 'setup' count non-empty cells on field to see if it's time to
 // start the game

  if (isSetup == null) isSetup=true;



  // watch set to update red and blue versions of the board when cells CHANGE
  tokensRef.on('child_changed', function(childSnapshot) {
    var empties = 0;
    var cell = {
      id:    childSnapshot.key(),
      row:   childSnapshot.val().row,
      col:   childSnapshot.val().col,
      color: childSnapshot.val().color,
      rank:  childSnapshot.val().rank
    }
    updateColors.updateColors(cell);

  });

  // boardInitialize with empties
  controller.post('/', function(req, res, next) {
    // remove all versions of the board and generate fresh, empty copies
    tokensRef.remove();
    tokBlueRef.remove();
    tokRedRef.remove();
    var cell = { 'row': 0, 'col': 0, color: 'none', rank: 'empty'};
    for (var i=1; i<19; i++) {
      for (var j=1; j<11; j++) {
        // place stars
        if (i==5 && (j==3 || j==7)) {
          color = 'none';
          rank = '1-star';
        } else if (i==5 && (j==4 || j==8)) {
          color = 'none';
          rank = '2-star';
        } else if (i==6 && (j==3 || j==7)) {
          color = 'none';
          rank = '3-star';
        } else if (i==6 && (j==4 || j==8)) {
          color = 'none';
          rank = '4-star';
        } else {
          color = 'none';
          rank = 'empty';
        }
        // console.log(i.toString(),j.toString(),color,rank);
        tokensRef.push().set({
          row: i.toString(),
          col: j.toString(),
          color: color,
          rank: rank
        });
        tokRedRef.push().set({
          row: i.toString(),
          col: j.toString(),
          color: color,
          rank: rank
        });
        tokBlueRef.push().set({
          row: i.toString(),
          col: j.toString(),
          color: color,
          rank: rank
        });
      }
    }
    res.json({ message : "success"});
  });

// set empty field and full trays
  controller.put('/trays', function(req, res, next) {

    var length;
    var color;
    var rank;
    var blues = [ 1,2,3,3,4,4,4,5,5,5,5,6,6,6,6,7,7,7,7,8,8,8,8,8,
                    9,9,9,9,9,9,9,9,'m','m','m','m','m','m','s','f' ];
    var reds = [ 1,2,3,3,4,4,4,5,5,5,5,6,6,6,6,7,7,7,7,8,8,8,8,8,
                    9,9,9,9,9,9,9,9,'m','m','m','m','m','m','s','f' ];

    tokensRef.once("value", function(snapshot) {
      // for each cell id
      snapshot.forEach(function(childSnapshot) {
        thisRef = new Firebase(boardUrl + '/' + childSnapshot.key());
        // fill staging area with tokens from array
      if ((childSnapshot.val().row > 10) && (childSnapshot.val().row <=14)) {
          thisRef.update({color: 'blue', rank: blues.pop()});
        // replace any other blues with empties
      } else if (childSnapshot.val().color == 'blue') {
          thisRef.update({color: 'none', rank: 'empty'});
      }
      });
    });

    tokensRef.once("value", function(snapshot) {
      // for each cell id
      snapshot.forEach(function(childSnapshot) {
        thisRef = new Firebase(boardUrl + '/' + childSnapshot.key());
        // fill staging area with tokens from array
        if (childSnapshot.val().row >= 15) {
            r = reds.pop();
            thisRef.update({color: 'red', rank: r});
          // replace any other blues with empties
        } else if (childSnapshot.val().color == 'red') {
            thisRef.update({color: 'none', rank: 'empty'});
        }
      });
    });
    res.json({ message: 'success'});
  });

  // reset blue tray
  controller.put('/bluetray', function(req, res, next) {

    var color;
    var rank;
    var blues = [ 1,2,3,3,4,4,4,5,5,5,5,6,6,6,6,7,7,7,7,8,8,8,8,8,
                  9,9,9,9,9,9,9,9,'mine','mine','mine','mine','mine','mine','mine','flag' ];

    // find blue tokens in main board and replace with empty

    tokensRef.once("value", function(snapshot) {
      // for each cell id
      snapshot.forEach(function(childSnapshot) {
        thisRef = new Firebase(boardUrl + '/' + childSnapshot.key());
        // fill staging area with tokens from array
      if ((childSnapshot.val().row > 10) && (childSnapshot.val().row <=14)) {
          thisRef.update({color: 'blue', rank: blues.pop()});
        // replace any other blues with empties
      } else if (childSnapshot.val().color == 'blue') {
          thisRef.update({color: 'none', rank: 'empty'});
      }
      });
    });
    // returns a success json
    res.json({ message: 'success'});
  });

  // reset blue field
  controller.put('/bluefield', function(req, res, next) {
    // if anything was passed as an argument, this is a quick set

    var blues = [ 9 , 9 , 5 , 6 , 6 , 9 , 8 , 3 , 9 , 8 ,
                  4 , 7 , 2 ,'mine', 4 ,'mine', 5 , 5 ,'mine', 4 ,
                 'spy','mine', 8 , 7 , 3 ,'flag', 1 ,'mine', 8 , 6 ,
                  5 , 7 , 8 , 9 , 9 ,'mine', 9 , 9 , 6 , 7];
    var r;
    var cell = {};

    tokensRef.once("value", function(snapshot) {
      // for each cell id
      snapshot.forEach(function(csshot) {
        thisRef = new Firebase(boardUrl + '/' + csshot.key());
        // fill staging area with tokens from preset array
        if (csshot.val().row <= 4) {
          r = blues.pop();
          thisRef.update({color: 'blue', rank: r});
        // fill tray with empties
      } else if ((csshot.val().row > 10) && (csshot.val().row <=14)) {
          thisRef.update({color: 'none', rank: 'empty'});
        // replace any other blues with empties
      } else if (csshot.val().color == 'blue') {
          thisRef.update({color: 'none', rank: 'empty'});
      }
      });
    });
        // returns a success json
        res.json({ message: 'success'});
  });

  // reset red tray
  controller.put('/redtray', function(req, res, next) {
    // if anything was passed as an argument, this is a quick set
    var reds = [ 1,2,3,3,4,4,4,5,5,5,5,6,6,6,6,7,7,7,7,8,8,8,8,8,
                  9,9,9,9,9,9,9,9,'mine','mine','mine','mine','mine','mine','mine','flag' ];

    var r;

    tokensRef.once("value", function(snapshot) {
      // for each cell id
      snapshot.forEach(function(csshot) {
        thisRef = new Firebase(boardUrl + '/' + csshot.key());
        // fill staging area with tokens from array
        if (csshot.val().row >= 15) {
            r = reds.pop();
            thisRef.update({color: 'red', rank: r});
          // replace any other blues with empties
        } else if (csshot.val().color == 'red') {
            thisRef.update({color: 'none', rank: 'empty'});
        }
      });
    });
    res.json({ message: 'success'});
  });

  // quick set red field
  controller.put('/redfield', function(req, res, next) {
    // if anything was passed as an argument, this is a quick set
      // useful sample arrangement

    var reds = [ 5 , 8 , 6 ,'mine','flag', 4 ,'mine', 9 , 6 , 7 ,
                'mine', 7 , 3 , 5 , 9 , 1 ,'mine', 9 , 9 , 4 ,
                 5 , 3 ,'spy', 6 , 2 , 8 , 7 , 8 , 5 ,'mine',
                 9 ,'mine', 8 , 7 , 9 , 4 , 9 , 8 , 6 , 9];

   tokensRef.once("value", function(snapshot) {
     // for each cell id
     snapshot.forEach(function(csshot) {
       thisRef = new Firebase(boardUrl + '/' + csshot.key());
       // fill staging area with tokens from preset array
      if (csshot.val().row >= 7 && csshot.val().row <= 10) {
        r = reds.pop();
        thisRef.update({color: 'red', rank: r});
       // fill tray with empties
      } else if ((csshot.val().row >= 15) && (csshot.val().row <=18)) {
        thisRef.update({color: 'none', rank: 'empty'});
       // replace any other reds with empties
      } else if (csshot.val().color == 'red') {
        thisRef.update({color: 'none', rank: 'empty'});
      }
    });
   });
    res.json({ message: 'success'});
  });

  // move Token
  controller.put('/move', function(req, res, next) {
    // pull out arguments
    console.log('req.body');
    console.log(req.body);
    var org = {
      row: req.body.orgRow,
      col: req.body.orgCol,
      color:  'none',
      rank: 'empty',
      id: ''
    };
    var dst = {
      row: req.body.dstRow,
      col: req.body.dstCol,
      color: 'none',
      rank: 'empty',
      id: ''
    };

    var spot;
    var samespace = false;
    var moveResult;


    console.log('token.js ' + org.row,org.col,dst.row,dst.col);


// this pattern works
    // var q = tokensRef.orderByChild('row').startAt(org.col).endAt(org.col);
    // q.once('value',function(s) {
    //   s.forEach(function(t) {
    //     console.log(t.key(),t.val().row,t.val().col,t.val().color,t.val().rank);
    //   });
    // });
// this pattern worked


    // what mode are we in
    playersRef.child('turn').once("value", function(snapshot) {
      isSetup = (snapshot.val()=='setup');
      console.log('isSetup: ' + isSetup);
      console.log('playersRef ' + snapshot.val());

      // first get the id of the mover
        var qRef1 = tokensRef.orderByChild('row').startAt(org.row).endAt(org.row);
        qRef1.once("value", function(qSnap1) {
          qSnap1.forEach(function(s) {
            if (s.val().col == org.col) {
              org.id = s.key();
              org.color = s.val().color;
              org.rank = s.val().rank;
              console.log('org: ' + org.id,org.row,org.col,org.color,org.rank);
            }
          });
          // 2nd get the id of the prey
            var queryRef = tokensRef.orderByChild('row').startAt(dst.row).endAt(dst.row);
            queryRef.once("value", function(qSnap2) {
              qSnap2.forEach(function(t) {
                if (t.val().col == dst.col) {
                  dst.id = t.key();
                  dst.color = t.val().color;
                  dst.rank = t.val().rank;
                  console.log(t.val().row,t.val().col);
                  console.log('dst: ' + dst.id,dst.row,dst.col,dst.color,dst.rank);
                }
              });
              for (var key in dst) {
                console.log(key,dst[key]);
              }
              console.log('origin ' + org.row,org.col,org.id,org.color,org.rank);
              console.log('destination ' + dst.row,dst.col,dst.id,dst.color,dst.rank);

              if (isSetup) {
                moveResult = checkSet.checkSet(org,dst);
              } else {
                moveResult = checkMove.checkMove(org,dst);
              }
              console.log(moveResult)
              for (var key in dst) {
                console.log(key,dst[key]);
              }
              switch(moveResult) {
                case 'same square':
                case 'forbidden':
                case 'immovable':
                case 'mover out of bounds':
                case 'destination out of bounds':
                case 'out of bounds':
                  break;
                case 'move to empty space':
                  // swap empty with mover
                  console.log('here ' + dst.id);
                  // update destination with origin specs
                  // might work, but it slows things down. Now going to add a button
                  // if (isSetup) {
                  //   console.log('isSetup');
                  //   cnt = 0;
                    tokensRef.child(dst.id).update({ color: org.color, rank: org.rank });
                  //     tokensRef.once("value", function(snapshot) {
                  //       snapshot.forEach(function(childSnapshot) {
                  //         if (childSnapshot.val().row > 10 && childSnapshot.val().rank=='empty') cnt++;
                  //         console.log(childSnapshot.val().row,childSnapshot.val().rank );
                  //         if (cnt==80) {
                  //           playersRef.update({ turn: 'blue'});
                  //         }
                  //       });
                  //     })
                  //   );
                  // }
                  // update origin with empty
                  tokensRef.child(org.id).update({ color: 'none', rank: 'empty' });
                  break;
                case 'victory':
                  // swap org and dst
                  // update destination with origin spec
                  tokensRef.child(dst.id).update({ color: org.color, rank: org.rank });
                  // update origin with empty
                  tokensRef.child(org.id).update({ color: 'none', rank: 'empty' });
                  // move loser to empty space in appropriate tray
                  discard.discard(dst.color, dst.rank);
                  break;
                case 'win':
                  // swap org and dst
                  // update destination with origin spec
                  tokensRef.child(dst.id).update({ color: org.color, rank: org.rank });
                  // update origin with empty
                  tokensRef.child(org.id).update({ color: 'none', rank: 'empty' });
                  // move loser to empty space in appropriate tray
                  discard.discard(dst.color, dst.rank);
                  break;
                case 'defeat':
                  // just place the mover in the tray
                  tokensRef.child(org.id).update({ color: 'none', rank: 'empty' });
                  // move loser to empty space in appropriate tray
                  discard.discard(org.color, org.rank);
                  break;
                case 'double defeat':
                  // move org and dst to tray, replace with empties
                  // mover first
                  // just place the mover in the tray
                  tokensRef.child(org.id).update({ color: 'none', rank: 'empty' });
                  // move loser to empty space in appropriate tray
                  discard.discard(org.color, org.rank);
                  // prey next
                  // just place the mover in the tray
                  tokensRef.child(dst.id).update({ color: 'none', rank: 'empty' });
                  // move loser to empty space in appropriate tray
                  discard.discard(org.color, org.rank);
                  res.json({ message: moveResult });
                  break;
                default:
              }
            }); // end get id of the prey

      }); // end get id of the mover

    }); // end playersRef setup check

    res.json({ message: moveResult });

  }); // end controller.put

  var onComplete = function(error) {
    if (error) {
      console.log('Synchronization failed');
    } else {
      console.log('Synchronization succeeded');
    }
  };

  module.exports = controller;
