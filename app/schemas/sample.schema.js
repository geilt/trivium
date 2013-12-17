/**
 * Sample Schema
 */
var Mongoose = require('mongoose');

var SampleSchema = new Mongoose.Schema({
	dateCreated: { type: Date, default: Date.now },
	message: String,
});

exports = Mongoose.model('Samples', SampleSchema);