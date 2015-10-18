  var boardModel = require('../models/Board');
  var playerModel = require('../models/Player')
  var bodyParser = require('body-parser');

  module.exports = {

    // Replace enemy tokens with a blank piece (the backside) so that
    // each player only sees their own tokens.
    hideTokens: function(player,o) {
      var temp;
      var repl;

      // console.log('hideTokens');
      if (player == 'blue') {
        repl = 'rback';
        ltr = 'r';
      } else {
        repl = 'bback';
        ltr = 'b'
      }
      for (var key in o) {

          if (o[key].tokenSpec.charAt(0) == ltr) {
            o[key].tokenSpec = repl;
        }
      }

      return o;

    }
  }
