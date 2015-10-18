var mongoose = require('mongoose');
var _ = require('lodash');

// 1 declare a schema
// blue for objects
var BoardSchema = new mongoose.Schema({
  row: Number,
  col: Number,
  tokenSpec: String
});

// 2 export the model
// mongoose.model('string name of model', schema)
module.exports = mongoose.model('Board', BoardSchema);
