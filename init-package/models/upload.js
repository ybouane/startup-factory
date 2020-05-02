const config = require('../config/config');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const uniqueValidator = require('mongoose-unique-validator');

var UploadSchema = new Schema({
	originalName	: { type: String },
	author			: { type: ObjectId, required: true, ref:'Account' },
	format			: { type: String, required: true, /*enum: ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'zip', 'doc']*/ },
	uploader		: { type: String, required: true, enum:['profilePicture',] },
	uploadKey		: { type: String, required: true, unique: true, index: true },
	status			: { type: String, default: 'preparing', enum: ['preparing', 'uploading', 'processing', 'uploaded', 'deleted', 'canceled'] },
	size			: { type: Number, required: true, min:0 },
	public			: { type: Boolean, required: true, default:false },
	bucket			: { type: String, required: true },
	variations		: [
		{
			format			: { type: String, required: true, /*enum: ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'zip', 'doc']*/ },
			key				: { type: String, required: true, index: true, unique: false },
			size			: { type: Number, required: true, min:0 },
			public			: { type: Boolean, required: true, default:true },
			w				: {	type: Number },
			h				: {	type: Number },
		}
	],
	meta			: {
		uploadId	: { type: String },
	},
	uploadDate		: { type: Date, required: true, default: Date.now },
});
UploadSchema.plugin(uniqueValidator);

module.exports = db => db.model('Upload', UploadSchema);
