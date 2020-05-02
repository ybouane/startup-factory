'use strict';
const config				= require('../config/config');
const safeConstants			= require('../config/safeConstants');

const H				= require('upperh');
const mongoose		= require('mongoose');
const AWS			= require('aws-sdk');
const S3			= new AWS.S3({
	region				: config.s3Region,
	signatureVersion	: 'v4',
});


const {dftFilters, sendEmail} = require('../helpers/helpers');


// DB connection
const siteDb = mongoose.createConnection(config.db.dbUrl, {
	user				: config.db.user,
	pass				: config.db.pass,
	useNewUrlParser		: true,
	useUnifiedTopology	: true,
	useCreateIndex		: true,
});

// DB Models
const Account 		= require('../models/account')(siteDb);
const Upload		= require('../models/upload')(siteDb);
const Job			= require('../models/job')(siteDb);


(async () => {
	console.log('Jobs Server loaded!');
	while(true) {
		var job = await Job.find({
			status			: 'queued',
			timestampRun	: {$lt : Date.now()},
		}).sort('priority -timeSensitive timestampRun').limit(1);
		if(job.length==0) {
			job = await Job.find({
				status			: 'queued',
				timeSensitive	: false,
			}).sort('priority timestampRun').limit(1);
		}
		if(job.length==1) {
			job = job[0];
			job.status = 'processing';
			await job.save();
			var doComplete = true;
			try {
				console.log('Executing job: '+job.jobType);
				console.log(job.data);
				switch(job.jobType) {
					case 'sendEmail':
						doComplete = false;
						//await sendEmail(job);
					break;
				}
				if(doComplete)
					job.status = 'complete';
				job.markModified('data');
				await job.save();
			} catch(e) {
				job.status = 'failed';
				await job.save();
				console.error(e);
			}
		}
		await H.delay(800);
	}
})();
