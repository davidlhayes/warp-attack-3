  var express = require('express');
  var controller = express.Router();

  var bodyParser = require('body-parser');
  var Firebase = require("firebase");

  var tokensRef = new Firebase('https://warp-attack-3.firebaseIO.com/board');
  var playersRef = new Firebase('https://warp-attack-3.firebaseIO.com/players');

  // boardDelete
  controller.post('/', function(req, res, next) {
    playersRef.remove();
    playersRef.set({
      red : false,
       blue: false,
       turn: 'setup',
       lastOrg: { row: 1, col: 2 },
       lastDst: { row: 1, col: 2 },
       lastMover: { color: 'none', rank: 'empty' },
       lastPrey: { color: 'none', rank: 'empty' },
       lastMoverSurvived: false,
       lastPreySurvived: false,
       moveResult: 'none'
    });
    res.json({ message: 'success'});
  });

  controller.get('/', function(req, res, next) {
    playersRef.once("value", function(snapshot) {
      res.json(snapshot.val());
    });
  });







  // });

  // controller.get('/redpresent', function(req, res, next) {
  //   playersRef.once("value", function(snapshot) {
  //     presence = { bluepresent: snapshot.val().blue };
  //     res.json(presence);
  //   });
  // });

  // controller.get('/bluepresent', function(req, res, next) {
  //   // playerModel.find(function(error,players) {
  //   //   if (error) return error;
  //   //   presence = { bluepresent: players[0].blue };
  //   //   res.json(presence);
  //   // });
  // });

  // controller.put('/setredpresence', function(req, res, next) {
    // playerModel.update({red: true},function(error,players) {
    //   if (error) return error;
    //   res.json({ message: 'success'});
    // });
  // });

  // controller.put('/endredpresence', function(req, res, next) {
    // playerModel.update({red: false},function(error,players) {
    //   if (error) return error;
    //   res.json({ message: 'success'});
    // });
  // });

  // controller.put('/setbluepresence', function(req, res, next) {
    // playerModel.update({blue:true},function(error,players) {
    //   if (error) return error;
    //   res.json({ message: 'success'});
    // });
  // });

  // controller.put('/endbluepresence', function(req, res, next) {
    // playerModel.update({blue:false},function(error,players) {
    //   console.log('endbluepresence');
    //   if (error) return error;
    //   res.json({ message: 'success'});
    // });
  // });

module.exports = controller;
