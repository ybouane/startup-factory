const H = require('upperh');
const fs = require('fs');
const config = require('../config/config');
const mailgun = require('mailgun-js');

var mg;
var sendEmail = () => {console.error('Mailgun API KEY not configured.');};
if(config.mailgun.apiKey) {
	mg = mailgun({apiKey: config.mailgun.apiKey, domain: config.mailgun.domain});
	sendEmail = async (to, from, subject, html, text) => {
		text = text || html;
		return new Promise(function(resolve, reject) {
			mg.messages().send({
				from		: from,
				to			: to,
				subject		: subject,
				html		: html,
				text		: text,
			}, function (error, body) {
				if(error)
					return reject(error);
				resolve(body);
			});
		});
	};
}



const dftFilters = {
	uppercase		: s=>s.toUpperCase(),
	lowercase		: s=>s.toLowerCase(),
	escape			: H.escape,
	relative_time	: H.relativeTime,
	asset_url		: (upload, minSize=false) => {
		if(!upload || !upload.uploadKey || !upload.bucket)
			return '/images/no-image.svg';
		if(upload.variations && upload.variations.length>0) {
			var idx = (minSize && upload.variations.findIndex(v=>v.w>=minSize && v.h>=minSize)) || 0;
			if(idx<0)
				idx = 0;
			return 'https://'+upload.bucket+'.s3.amazonaws.com/'+upload.variations[idx].key;
		} else
			return 'https://'+upload.bucket+'.s3.amazonaws.com/'+upload.uploadKey;
	},
	json			: (data, beautiful) => {
		if(beautiful)
			return String(JSON.stringify(data, null, 4));
		return String(JSON.stringify(data));
	},
	file_size		: (bytes) => {
		var exts = ['B', 'KB', 'MB', 'GB', 'TB'];
		bytes = parseInt(bytes) || 0;
		for(let ext of exts) {
			if(bytes<1024)
				return Math.round(bytes)+ext;
			bytes /= 1024;
		}
		return Math.round(bytes*1024)+exts[exts.length-1];
	},
	'if'			: (whenTrue, cond, otherwise) => {
		if(cond)
			return whenTrue;
		else
			return otherwise;
	},
	money			: (amount, currency) => {
		amount = amount || 0;
		currency = (currency || '').toLowerCase();
		return (currency=='usd'?'US':'')+(new Intl.NumberFormat('en-US', { style: 'currency', currency: currency||config.platformCurrency }).format(amount/100));
	},
	date			: (date) => {
		return new Intl.DateTimeFormat('en-US', {
			dateStyle	: 'medium',
			timeStyle	: 'short',
			//day		: '2-digit',
			//month	: '2-digit',
			//year	: 'numeric',
			//year	: 'numeric',
		}).format(date);
	},
	file_version	: async (path, cb) => {
		if(path.match(/\.\.|\/\//)) {
			cb('Invalid path');
			return;
		}
		fs.stat(__dirname+'/../public/'+path, (err, stat)=>{
			if(err)
				cb(undefined, path);
				//cb(err.toString());
			else
				cb(undefined, path+'?'+stat.mtime.getTime().toString(36));
		});
	},
	nl2br			: (str) => {
		return H.escape(str).replace(/\r?\n/g, "\n<br />");
	}
};

module.exports = {
	dftFilters,
	sendEmail
};
