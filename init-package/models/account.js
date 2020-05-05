const H = require('upperh');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const uniqueValidator = require('mongoose-unique-validator');

var AccountSchema = new Schema({
	name					: { type: String, required: true, unique: false, index:true, trim: true, minlength:4 },
	bio						: { type: String, default: '', trim: true, maxlength:160, },
	email					: { type: String, required: true, unique: true, index:true, trim: true, lowercase: true, match: H.regexp.email },
	passHash				: { type: String, required: true },
	passSalt				: { type: String, required: true },
	dateCreated				: { type: Date,	required:true, default: Date.now },
	lastActive				: { type: Date,	required:true, default: Date.now },
	isAdmin					: { type: Boolean, default: false },
	profilePicture			: { type: ObjectId, ref: 'Upload' },
	/*canAcceptPayments		: { type: Boolean, default:false },
	stripeAccount			: {
		type: Schema.Types.Mixed,
	},*/
	extras					: { type: Schema.Types.Mixed },
});
AccountSchema.plugin(uniqueValidator);

module.exports = db => db.model('Account', AccountSchema);
