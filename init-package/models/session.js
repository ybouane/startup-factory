const H = require('upperh');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const uniqueValidator = require('mongoose-unique-validator');

var SessionSchema = new Schema({
	userId							: { type: ObjectId },
	value							: { type: Schema.Types.Mixed },
	creationDate					: { type: Date, expires:8*24*3600, default: Date.now }, // 8 days
	//stripeStateToken				: { type: String, required: false },
	//stripeStateTokenCreationDate	: { type: Date, required: false },
	emailVerificationCode			: { type: Schema.Types.Mixed, required: false, },
});
SessionSchema.plugin(uniqueValidator);

module.exports = db => db.model('Session', SessionSchema);
