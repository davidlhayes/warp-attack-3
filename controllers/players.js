  var express = require('express');
  var controller = express.Router();

  var playerModel = require('../models/Player');
  var boardModel = require('../models/Board');
  var bodyParser = require('body-parser');
  var Firebase = require("firebase");

  var tokensRef = new Firebase('https://warp-attack-3.firebaseIO.com/board');
  var playersRef = new Firebase('https://warp-attack-3.firebaseIO.com/players');

  // boardDelete
  controller.post('/', function(req, res, next) {
    playersRef.remove();
    playersRef.set({
      'red' : false,
       'blue': false,
       'turn': 'setup',
       'lastOrg': { row: 1, col: 2},
       'lastDst': { row: 1, col: 2},
       'lastMover': 'none',
       'lastPrey': 'none',
       'lastMoverSurvived': false,
       'lastPreySurvived': false
    });
    playersRef.on("value", function(snapshot) {
      res.json(snapshot.val());
    }, function(errorObject) {
      err = "The read failed: " + errorObject.code;
      res.json({err: message});
    });
  });

  controller.get('/', function(req, res, next) {
    playersRef.once("value", function(snapshot) {
      res.json(snapshot.val());
    });
  });

  controller.get('/turn', function(req, res, next) {
    // determine current turn
    var turn;
    // get current info
    playersRef.once("value", function(snapshot) {
    // initialize turn to setup when we don't see both players logged in
      console.log('/turn is ' + snapshot.val().turn);
      if (!snapshot.val().red || !snapshot.val().blue || snapshot.val().turn==null) {
        playersRef.update({ turn: 'setup'});
      } else {
        // if in setup mode perform a special check
        if (snapshot.val().turn == 'setup') {
          tokensRef.orderByChild("tokenSpec").equalTo("empty").on("value", function(snp) {
            var empties = Object.keys(snp.val()).length;
            console.log(empties);
          });

        } // end of players turn setup
      } // players red or blue

      res.json({ 'turn': snapshot.val().turn});

    }); // 1st playerModel

}); // controller.get


  controller.get('/movement', function(req, res, next) {
    playerModel.find(function(error,players) {
      if (error) return error;
      var movement = { movement : 'Last movement: '
       + players[0].lastOrg.row + ':' + players[0].lastOrg.col
       + ' to '
       + players[0].lastDst.row + ':' + players[0].lastDst.col };
      res.json(movement);
    });
  });

  controller.get('/redpresent', function(req, res, next) {
    playerModel.find(function(error,players) {
      if (error) return error;
      presence = { redpresent: players[0].red };
      res.json(presence);
    });
  });

  controller.get('/bluepresent', function(req, res, next) {
    playerModel.find(function(error,players) {
      if (error) return error;
      presence = { bluepresent: players[0].blue };
      res.json(presence);
    });
  });

  controller.put('/setredpresence', function(req, res, next) {
    playerModel.update({red: true},function(error,players) {
      if (error) return error;
      res.json({ message: 'success'});
    });
  });

  controller.put('/endredpresence', function(req, res, next) {
    playerModel.update({red: false},function(error,players) {
      if (error) return error;
      res.json({ message: 'success'});
    });
  });

  controller.put('/setbluepresence', function(req, res, next) {
    playerModel.update({blue:true},function(error,players) {
      if (error) return error;
      res.json({ message: 'success'});
    });
  });

  controller.put('/endbluepresence', function(req, res, next) {
    playerModel.update({blue:false},function(error,players) {
      console.log('endbluepresence');
      if (error) return error;
      res.json({ message: 'success'});
    });
  });

module.exports = controller;
