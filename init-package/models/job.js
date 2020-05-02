const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var JobSchema = new Schema({
	jobType				: { type: String, enum:['sendEmail'] },
	status				: { type: String, required: true, default: 'queued', index: true, unique: false, enum:['queued', 'processing', 'complete', 'failed'] },
	priority			: { type: Number, required: true, default: 3, min:1, max:3 },
	timeSensitive		: { type: Boolean, required: true, default: false },
	timestampCreated	: { type: Date, required: true, default: Date.now },
	timestampRun		: { type: Date, required: true, default: Date.now, index: true, unique: false },
	log					: [
		{
			message	: { type: String},
			level	: { type: String, enum:['error', 'warning', 'info'] },
			extras	: { type: Schema.Types.Mixed},
		}
	],
	data				: {
		type		: Schema.Types.Mixed,
		required	: true,
		/*get			: (data) => {
			try {
				return JSON.parse(data);
			} catch(e) {
				return data;
			}
		},
		set			: (data) => JSON.stringify(data),*/
	},
});

module.exports = db => db.model('Job', JobSchema);
