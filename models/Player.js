var mongoose = require('mongoose');

// 1 declare a schema
// blue for objects
var PlayerSchema = new mongoose.Schema({
  red: Boolean,
  blue: Boolean,
  turn: String,
  lastOrg: { row: Number, col: Number},
  lastDst: { row: Number, col: Number},
  lastMover: String,
  lastPrey: String,
  lastMoverSurvived: Boolean,
  lastPreySurvived: Boolean
});

// 2 export the model
// mongoose.model('string name of model', schema)
module.exports = mongoose.model('Player', PlayerSchema);
