const H = require('upperh');
const safeConstants = require('./safeConstants');

const KB = 1024;
const MB = 1024*1024;
const GB = 1024*1024*1024;
const TB = 1024*1024*1024*1024;
module.exports = {

	...safeConstants,

	s3Region			: 'us-east-2',

	/*
	// Set CORS policy of bucket as follows:
	<?xml version="1.0" encoding="UTF-8"?>
	<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
	<CORSRule>
		<AllowedOrigin>https://sweetdata.io</AllowedOrigin>
		<AllowedMethod>GET</AllowedMethod>
		<AllowedMethod>PUT</AllowedMethod>
		<AllowedMethod>POST</AllowedMethod>
		<MaxAgeSeconds>3000</MaxAgeSeconds>
		<ExposeHeader>ETag</ExposeHeader>
		<AllowedHeader>Authorization</AllowedHeader>
		<AllowedHeader>x-amz-date</AllowedHeader>
		<AllowedHeader>x-amz-content-sha256</AllowedHeader>
		<AllowedHeader>content-type</AllowedHeader>
	</CORSRule>
	<CORSRule>
		<AllowedOrigin>*</AllowedOrigin>
		<AllowedMethod>GET</AllowedMethod>
		<MaxAgeSeconds>3000</MaxAgeSeconds>
	</CORSRule>
	</CORSConfiguration>
	*/

	uploaders			: {
		profilePicture	: {
			bucket			: '',
			maxSize			: 3*MB,
			public			: true,
			formats			: ['jpg', 'gif', 'png'],
			processImage	: [{w:100, h:100, keySuffix:'-100' }],
			generateKey		: (file) => 'pp/'+H.uniqueToken()+'.'+file.extension,
		},
	},

	recaptcha	: {
		public	: safeConstants.recaptchaPublicKey,
		secret	: '',
	},

	mailgun	: {
		apiKey	: '',
		domain	: '_DOMAIN_',
		baseUrl	: 'https://api.mailgun.net/v3/_DOMAIN_',
	},

	/*stripe	: {
		publicKey	: '',
		secretKey	: '',
		clientId	: '',
		redirectUrl	: 'https://_DOMAIN_/stripeOAuth',
	},*/
	db	: {
		dbUrl		: 'mongodb://localhost:27017/_DB_NAME_',
		user		: '_PROJECT_HANDLE_',
		pass		: '_DB_PASS_',
	},
};
