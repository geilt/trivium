/**
 * Sample Model
 * Put Mongoose Schemas or other Model definitions here.
 * Put Model functions in here as well. 
 * Note that Mongoose Models and this Model should be treated as two different things. 
 * This Model is an MVC type of model that deals with both database interaction 
 * as well as other business logic related to the model.
 */
var Mongoose = require('mongoose');

var SampleSchema = new Mongoose.Schema({
	dateCreated: { type: Date, default: Date.now },
	message: String,
});

exports = Mongoose.model('Samples', SampleSchema);

exports.sampleModelFunction = function(sampleArgument){
	return sampleArgument;
};