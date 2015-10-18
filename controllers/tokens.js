  var express = require('express');
  var controller = express.Router();

  var Firebase = require("firebase");
  var boardModel = require('../models/Board');
  var bodyParser = require('body-parser');
  var transform = require('../logic/transform');
  var playerModel = require('../models/Player');
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

  // Board API -- set board tokens, move tokens (as governed by game rules)
 //  and get token placement information

  // boardDelete
  controller.delete('/', function(req, res, next) {
    boardModel.collection.remove();
    boardModel.find(function(error,tokens) {
      if (error) return error;
      res.json(tokens);
    });
  });

  // boardInitialize
  controller.post('/', function(req, res, next) {
    tokensRef.remove();
    tokBlueRef.remove();
    tokRedRef.remove();
    var cell = { 'row': 0, 'col': 0, color: 'none', rank: 'empty'};
    for (var i=1; i<19; i++) {
      for (var j=1; j<11; j++) {
        // place stars
        if (i==5 && (j==3 || j==7)) {
          color = 'none';
          rank = 'star-tl';
        } else if (i==5 && (j==4 || j==8)) {
          color = 'none';
          rank = 'star-tr';
        } else if (i==6 && (j==3 || j==7)) {
          color = 'none';
          rank = 'star-bl';
        } else if (i==6 && (j==4 || j==8)) {
          color = 'none';
          rank = 'star-br';
        } else {
          color = 'none';
          rank = 'empty';
        }
        console.log(i.toString(),j.toString(),color,rank);
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

    tokensRef.remove();
    var cell = { 'row' : 0, 'col' : 0, tokenSpec : 'none'};
    // set up main board with empty cells and stars
    for (var i=1; i<19; i++) {
      for (var j=1; j<11; j++) {
        // place stars
        if (i==5 && (j==3 || j==7)) {
          color = 'none';
          rank = 'star-tl';
        } else if (i==5 && (j==4 || j==8)) {
          color = 'none';
          rank = 'star-tr';
        } else if (i==6 && (j==3 || j==7)) {
          color = 'none';
          rank = 'star-bl';
        } else if (i==6 && (j==4 || j==8)) {
          color = 'none';
          rank = 'star-br';
        } else if (i <= 10) {
          color = 'none';
          rank = 'empty';
        } else if (i <= 14) {
          color = 'blue';
          rank = blues.pop();
        } else {
          color = 'red'
          rank = reds.pop();
        }
        console.log(i.toString(),j.toString(),color, rank);
        tokensRef.push().set({
          row: i.toString(),
          col: j.toString(),
          color: color,
          rank: rank
        });
      }
    }
    tokensRef.on("value", function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        updateColors.updateColors(childSnapshot.val());
        console.log(childSnapshot.val());
      });
      console.log('complete childsnapshot');
      // res.json(snapshot.val());
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


    tokensRef.once("value", function(snapshot) {
      // for each cell id
      snapshot.forEach(function(childSnapshot) {
        thisRef = new Firebase(boardUrl + '/' + childSnapshot.key());
        // fill staging area with tokens from preset array
        if (childSnapshot.val().row <= 4) {
        thisRef.update({color: 'blue', rank: blues.pop()});
        // fill tray with empties
      } else if ((childSnapshot.val().row > 10) && (childSnapshot.val().row <=14)) {
          thisRef.update({color: 'none', rank: 'empty'});
        // replace any other blues with empties
      } else if (childSnapshot.val().color == 'blue') {
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

    tokensRef.once("value", function(snapshot) {
      // for each cell id
      snapshot.forEach(function(childSnapshot) {
        thisRef = new Firebase(boardUrl + '/' + childSnapshot.key());
        // fill staging area with tokens from array
      if (childSnapshot.val().row >= 15) {
          thisRef.update({color: 'red', rank: reds.pop()});
        // replace any other blues with empties
      } else if (childSnapshot.val().color == 'red') {
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
     snapshot.forEach(function(childSnapshot) {
       thisRef = new Firebase(boardUrl + '/' + childSnapshot.key());
       // fill staging area with tokens from preset array
       if (childSnapshot.val().row >= 7 && childSnapshot.val().row <= 10) {
       thisRef.update({color: 'red', rank: reds.pop()});
       // fill tray with empties
     } else if ((childSnapshot.val().row >= 15) && (childSnapshot.val().row <=18)) {
         thisRef.update({color: 'none', rank: 'empty'});
       // replace any other blues with empties
     } else if (childSnapshot.val().color == 'red') {
         thisRef.update({color: 'none', rank: 'empty'});
     }
     });
   });
    res.json({ message: 'success'});
  });


  // get all
  controller.get('/', function(req, res, next) {
    tokensRef.on("value", function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        updateColors.updateColors(childSnapshot.val());
      });
      res.json(snapshot.val());
    }, function (errorObject) {
      err = "The read failed: " + errorObject.code;
      res.json({err: message});
    });
  });

  // move Token
  controller.put('/move', function(req, res, next) {
    // pull out arguments
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

    // what mode are we in
    playersRef.child('turn').once("value", function(snapshot) {
      var isSetup = (snapshot.val()=='setup');
      console.log('isSetup: ' + isSetup);
      console.log('playersRef ' + snapshot.val());

      // first get the id of the mover
        var qRef1 = tokensRef.orderByChild('row').startAt(org.col).endAt(org.col);
        qRef1.once("value", function(qSnap1) {
          for (var key in qSnap1.val()) {
            console.log('qSnap1 ' + qSnap1.val()[key].col)
            if (qSnap1.val()[key].col == org.col) {
              org.id = qSnap1.val()[key]._id;
              org.color = qSnap1.val()[key].color;
              org.rank = qSnap1.val()[key].rank;
            }
          }
          // 2nd get the id of the prey
            var queryRef = tokensRef.orderByChild('row').startAt(dst.col).endAt(dst.col);
            queryRef.once("value", function(qSnap2) {
              for (var key in qSnap2.val()) {
                if (qSnap2.val()[key].col == org.col) {
                  dst.id = qSnap1.val()[key]._id;
                  dst.color = qSnap1.val()[key].color;
                  dst.rank = qSnap1.val()[key].rank;
                }
              }

              console.log('original ' + org.row,org.color,org.id,org.color,org.rank);
              console.log('destination ' + dst.row,dst.color,dst.id,dst.color,dst.rank);

              if (isSetup) {
                moveResult = checkSet.checkSet(org,dst);
              } else {
                moveResult = checkMove.checkMove(org,dst);
              }
              console.log(moveResult)

            }); // end get id of the prey

      }); // end get id of the mover

    }); // end playersRef setup check

    res.json({ message: 'success'});

  }); // end controller.put


  module.exports = controller;
