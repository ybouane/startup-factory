'use strict';
const config				= require('../config/config');
const safeConstants			= require('../config/safeConstants');

const H			= require('upperh');
const sharp		= require('sharp');
const mongoose	= require('mongoose');
const cookie	= require('cookie');
//const stripe	= require('stripe')(config.stripe.secretKey);
const AWS		= require('aws-sdk');
const S3		= new AWS.S3({
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
const Account 			= require('../models/account')(siteDb);
const Session			= require('../models/session')(siteDb);
const Upload			= require('../models/upload')(siteDb);
const Job				= require('../models/job')(siteDb);



const renderPage = async (file, data, filters={}) => {
	filters = {
		...dftFilters,
		...filters,
	};
	var includeCb = (name) => {
		var p = __dirname+'/../templates/'+name.replace(/[^a-z0-9A-Z\.\/-]/g, '').replace(/\.+/g, '.');
		try {
			return {src: H.readFileSync(p), path:p};
		} catch(e) {
			return {src:'', path:p};
		}
	};
	var out = await H.renderFile('../templates/head.jinja', data, filters, includeCb);
	out += await H.renderFile(file, data, filters, includeCb);
	out += await H.renderFile('../templates/foot.jinja', data, filters, includeCb);
	return out;
};
const renderEmail = async (file, data, filters={}) => {
	filters = {
		...dftFilters,
		...filters,
	};
	var includeCb = (name) => {
		var p = __dirname+'/../templates/emails/'+name.replace(/[^a-z0-9A-Z\.-]/g, '');
		try {
			return {src: H.readFileSync(p), path:p};
		} catch(e) {
			return {src:'', path:p};
		}
	};
	var out = await H.renderFile('../templates/emails/head.jinja', data, filters, includeCb);
	out += await H.renderFile(file, data, filters, includeCb);
	out += await H.renderFile('../templates/emails/foot.jinja', data, filters, includeCb);
	return out;
};

H.httpServer(2323, async (req, res, _, method, data) => {

	var cookies = cookie.parse(req.headers.cookie || '');
	var session;
	var userAccount;
	if(cookies.siteSession) {
		session = await Session.findOne({ _id: String(cookies.siteSession) });
	}
	if(session) {
		if(session.userId) {
			userAccount = await Account.findOne({ _id: session.userId }).populate('profilePicture');
		}
	} else {
		session = new Session({
			value	: {}
		});
		await session.save();
		res.setHeader('Set-Cookie', [req.headers.cookie || '', cookie.serialize('siteSession', String(session._id), {
			httpOnly	: true,
			path		: '/',
			secure		: true,
			//maxAge		: 60 * 60 * 24 * 7 // 1 week
			expires		: new Date(1000 * (H.timestamp() + 60 * 60 * 24 * 365)), // 1 year
		})]);
	}

	var dftData = {
		userAccount,
		_constants	: safeConstants,
	};

	if(req.url.indexOf('/api/')==0 || ['POST', 'PUT', 'DELETE'].includes(req.method))
		res.useJSON = true;

	const checkAdmin = async () => {
		if(!userAccount || !userAccount.isAdmin)
			throw new H.Error('Access to this page is forbidden.');
	};

	return {
		'/'								: async (req, res, urlMatches, method, data) => {
			res.end(await renderPage('../templates/pages/home.jinja', {
				...dftData,
				page		: 'home',
				title		: '_PROJECT_NAME_',
			}));
		},
		'/sitemap.xml'					: async (req, res, urlMatches, method, data) => {
			var formatDate = (date) => {
				var d = new Date(date);
				return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2, '0')+'-'+String(d.getDate()).padStart(2, '0');
			}
			res.writeHead(200, {'Content-Type' : 'application/xml'});
			res.end(await H.renderFile('../templates/pages/sitemap.jinja', {
				...dftData,
				users		: await Account.find(),
				pages		: [
					'contact',
					'login',
					'signup',
					'about',
				],
				today		: formatDate(Date.now()),
			}, {
				...dftFilters,
				formatDate
			}));
		},
		'/robots.txt'					: async (req, res, urlMatches, method, data) => {
			res.writeHead(200, {'Content-Type' : 'text/plain'});
			res.end(await H.renderFile('../templates/pages/robots.jinja'));
		},
		'/about'						: async (req, res, urlMatches, method, data) => {
			res.end(await renderPage('../templates/pages/about.jinja', {
				...dftData,
				page		: 'about',
				title		: 'About us - _PROJECT_NAME_',
			}));
		},
		'/privacy'						: async (req, res, urlMatches, method, data) => {
			res.end(await renderPage('../templates/pages/privacy.jinja', {
				...dftData,
				page		: 'privacy',
				title		: 'Privacy Policy - _PROJECT_NAME_',
			}));
		},
		'/terms'						: async (req, res, urlMatches, method, data) => {
			res.end(await renderPage('../templates/pages/terms.jinja', {
				...dftData,
				page		: 'terms',
				title		: 'Terms and conditions - _PROJECT_NAME_',
			}));
		},
		'/account'						: async (req, res, urlMatches, method, data) => {
			if(!userAccount)
				return res.writeHead(302, {'Location': '/login'});
			/*if(!session.stripeStateToken || (Date.now() - session.stripeStateTokenCreationDate)>3600*1000) { // 1h
				session.stripeStateToken = H.uniqueToken();
				session.stripeStateTokenCreationDate = Date.now();
				session.save();
			}
			var paymentsData = {};
			if(userAccount.canAcceptPayments) {
				paymentsData = {
					loginLink 		: (await stripe.accounts.createLoginLink(userAccount.stripeAccount.stripe_user_id)).url,
					balance			: 0,
					transactions	: await Transaction.find({
						seller	: userAccount._id,
					}).populate('buyer seller products'),
				};
				var balance = (await stripe.balance.retrieve({stripe_account:userAccount.stripeAccount.stripe_user_id}));
				paymentsData.balance = {
					available	: balance.available.map(b=>({amount: b.amount, currency: b.currency })),
					pending		: balance.pending.map(b=>({amount: b.amount, currency: b.currency })),
				};
				var balanceAmounts = {};
				for(let b of paymentsData.balance.pending)
					balanceAmounts[b.currency] = (balanceAmounts[b.currency] || 0) + b.amount;
				for(let b of paymentsData.balance.available)
					balanceAmounts[b.currency] = (balanceAmounts[b.currency] || 0) + b.amount;

				paymentsData.balanceText = Object.keys(balanceAmounts).map(k=>dftFilters.money(balanceAmounts[k], k)).join(', ');
			} else {
				paymentsData = {
					clientId	: config.stripe.clientId,
					stateToken	: session.stripeStateToken,
				};
			}*/


			res.end(await renderPage('../templates/account/account.jinja', {
				...dftData,
				page		: 'account',
				title		: userAccount.name+' - My Account - _PROJECT_NAME_',
				//...paymentsData,
			}));
		},
		/*'/stripeOAuth'					: async (req, res, urlMatches, method, data) => {
			if(!userAccount)
				return res.writeHead(302, {'Location': '/login'});
			if(!session.stripeStateToken || (Date.now() - session.stripeStateTokenCreationDate)>3600*1000) // 1h
				throw new H.Error('State token has expired, please try again.', 403);
			if(!data.state || data.state!=session.stripeStateToken)
				throw new H.Error('Invalid state token.', 403);
			if(!data.code)
				throw new H.Error('Request is missing authorization code.', 403);

			try {
				userAccount.stripeAccount = await stripe.oauth.token({
					grant_type	: 'authorization_code',
					code		: data.code,
				});
				userAccount.markModified('stripeAccount');
				userAccount.canAcceptPayments = true;
				await userAccount.save();
			} catch(e) {
				throw new H.Error(e.error_description || 'An unexpected error occurred.');
			}

			return res.writeHead(302, {'Location': '/account'});
		},*/
		'/edit-profile'					: async (req, res, urlMatches, method, data) => {
			if(!userAccount)
				return res.writeHead(302, {'Location': '/login'});
			if(method=='POST') {
				try {
					if(data.bio!=undefined)
						userAccount.bio = String(data.bio);
					if(data.name!=undefined && String(data.name).length>3)
						userAccount.name = String(data.name);
					if(data.profilePicture != undefined) {
						userAccount.profilePicture = (data.profilePicture && await Upload.findOne({ status: 'uploaded', uploadKey:String(data.profilePicture) }, '_id')) || undefined;
						userAccount.profilePicture = userAccount.profilePicture && userAccount.profilePicture._id;
					}
					await userAccount.save();
					res.json({success:true, message:'Profile successfully modified. Redirecting...'});
				} catch(e) {
					res.json({success:false, message:e.toString()});
					//throw new H.Error('Some of the details you have entered are invalid.');
				}

			} else {
				res.end(await renderPage('../templates/account/edit-profile.jinja', {
					...dftData,
					page		: 'edit-profile',
					title		: userAccount.name+' - Modify my profile - _PROJECT_NAME_',
				}));
			}
		},

		'/uploader/createMultipartUpload'	: async (req, res, urlMatches, method, data) => {
			if(!userAccount)
				return res.json({success:false, message:'You must be logged in to perform this action.'});
			if(!data.file || !data.uploader || !config.uploaders.hasOwnProperty(data.uploader) || !data.file.name || !data.file.id || !data.file.extension || !data.file.size)
				throw new H.Error('Invalid upload request.');
			var uploader = config.uploaders[data.uploader];
			if(data.file.size>(uploader.maxSize || 3*1024*1024))
				throw 'Your can only upload files less than '+dftFilters.file_size(uploader.maxSize || 3*1024*1024)+'.';

			data.file.name = String(data.file.name);
			data.file.extension = String(data.file.extension).toLowerCase();
			if(data.file.name.slice(-1*data.file.extension.length)!=data.file.extension)
				throw new H.Error('Mismatch between filename and extension.');
			if(!uploader.formats.includes(data.file.extension))
				throw new H.Error('Only the following file extensions are allowed: '+uploader.formats.join(', '));

			var objKey = (uploader.generateKey && uploader.generateKey(data.file)) || H.uniqueToken();
			var params = {
				ACL				: uploader.public?'public-read':'private',
				Bucket			: uploader.bucket,
				Key				: objKey,
				ContentType		: config.mimeTypes[data.file.extension] || 'application/octet-stream',
				CacheControl	: 'max-age=2592000', // 30 days
			};

			var fileUpload = new Upload({
				originalName	: data.file.name,
				author			: userAccount._id,
				format			: data.file.extension,
				uploadKey		: params.Key,
				status			: 'preparing',
				size			: parseInt(data.file.size),
				bucket			: uploader.bucket,
				public			: uploader.public,
				uploader		: data.uploader,
				variations		: [],
				meta			: {
				},
			});
			try {
				var s3Call = await S3.createMultipartUpload(params).promise();
				await fileUpload.save();
				fileUpload.meta.uploadId = s3Call.UploadId;
				fileUpload.markModified('meta');
				await fileUpload.save();
				res.json({success:true, key: s3Call.Key, uploadId: s3Call.UploadId});
			} catch(e) {
				console.error(e);
				res.json({success:false, message:e.toString()});
			}
		},
		'/uploader/listParts'				: async (req, res, urlMatches, method, data) => {
			if(!userAccount)
				return res.json({success:false, message:'You must be logged in to perform this action.'});
			if(!data.uploadId || !data.key)
				throw new H.Error('Invalid upload request.');

			var fileUpload = await Upload.findOne({ uploadKey: String(data.key) });
			if(!fileUpload)
				throw new H.Error('Could not find file to be uploaded.');

			var params = {
				Bucket		: fileUpload.bucket,
				Key			: fileUpload.uploadKey,
				UploadId	: fileUpload.meta.uploadId
			};
			try {
				//var s3SignedUrl = await S3.getSignedUrlPromise('createMultipartUpload', params);
				var s3Call = await S3.listParts(params).promise();
				res.json({success:true, parts: s3Call.Parts});
			} catch(e) {
				res.json({success:false, message:e.toString()});
			}
		},
		'/uploader/prepareUploadPart'		: async (req, res, urlMatches, method, data) => {
			if(!userAccount)
				return res.json({success:false, message:'You must be logged in to perform this action.'});
			if(!data.uploadId || !data.key || !data.number)
				throw new H.Error('Invalid upload request.');

			var fileUpload = await Upload.findOne({ uploadKey: String(data.key) });
			if(!fileUpload)
				throw new H.Error('Could not find file to be uploaded.');

			var params = {
				Bucket		: fileUpload.bucket,
				Key			: fileUpload.uploadKey,
				UploadId	: fileUpload.meta.uploadId,
				PartNumber	: data.number,
				Body		: '',
				Expires		: 5*60,
			};
			try {
				var s3SignedUrl = await S3.getSignedUrlPromise('uploadPart', params);
				res.json({success:true, url: s3SignedUrl, headers:{} });
				fileUpload.status = 'uploading';
				await fileUpload.save();
			} catch(e) {
				res.json({success:false, message:e.toString()});
			}
		},
		'/uploader/abortMultipartUpload'	: async (req, res, urlMatches, method, data) => {
			if(!userAccount)
				return res.json({success:false, message:'You must be logged in to perform this action.'});
			if(!data.uploadId || !data.key)
				throw new H.Error('Invalid upload request.');

			var fileUpload = await Upload.findOne({ uploadKey: String(data.key) });
			if(!fileUpload)
				throw new H.Error('Could not find file to be uploaded.');

			var params = {
				Bucket		: fileUpload.bucket,
				Key			: fileUpload.uploadKey,
				UploadId	: fileUpload.meta.uploadId
			};
			try {
				//var s3SignedUrl = await S3.getSignedUrlPromise('createMultipartUpload', params);
				fileUpload.status = 'canceled';
				await fileUpload.save();
				var s3Call = await S3.abortMultipartUpload(params).promise();
				res.json({success:true});
			} catch(e) {
				res.json({success:false, message:e.toString()});
			}
		},
		'/uploader/completeMultipartUpload'	: async (req, res, urlMatches, method, data) => {
			if(!userAccount)
				return res.json({success:false, message:'You must be logged in to perform this action.'});
			if(!data.uploadId || !data.key || !data.parts)
				throw new H.Error('Invalid upload request.');

			var fileUpload = await Upload.findOne({ uploadKey: String(data.key) });
			if(!fileUpload)
				throw new H.Error('Could not find file to be uploaded.');

			var params = {
				Bucket			: fileUpload.bucket,
				Key				: fileUpload.uploadKey,
				UploadId		: fileUpload.meta.uploadId,
				MultipartUpload	: { Parts : data.parts },
			};
			try {
				var s3Call = await S3.completeMultipartUpload(params).promise();

				// process images
				var uploader = config.uploaders[fileUpload.uploader];
				if(uploader.processImage && uploader.processImage.length>0) {
					try {
						fileUpload.status = 'processing';
						await fileUpload.save();
						// 1) Retrieve image
						var imgBuff = await S3.getObject({
							Bucket	: fileUpload.bucket,
							Key		: fileUpload.uploadKey,
						}).promise();

						// 2) Loop and generate thumbnails
						for(let pr of uploader.processImage) {
							if(pr.w && pr.h)
							var imgProc = await sharp(imgBuff.Body)
							.rotate()
							.resize(pr.w, pr.h, {
								kernel				: sharp.kernel.lanczos3,//sharp.kernel.cubic,
								fit					: 'inside',
								withoutEnlargement	: true,
							})
							.jpeg({quality:90, chromaSubsampling: '4:4:4', progressive:true, force:false})
							.png({quality:100, force:false})
							.webp({quality:95, force:false})
							.tiff({quality:95, force:false})
							.toBuffer({
								resolveWithObject	: true
							});

							var imgProcInfo = {
								format		: fileUpload.format,
								key			: fileUpload.uploadKey.replace(/\.([a-z0-9]+)$/, pr.keySuffix+'.$1'),
								size		: imgProc.info.size,
								public		: pr.public!=undefined?pr.public:uploader.public,
								w			: imgProc.info.width,
								h			: imgProc.info.height,
							};

							await S3.putObject({
								ACL				: imgProcInfo.public?'public-read':'private',
								Body			: imgProc.data,
								Bucket			: fileUpload.bucket,
								Key				: imgProcInfo.key,
								ContentType		: config.mimeTypes[fileUpload.format] || 'application/octet-stream',
								CacheControl	: 'max-age=2592000', // 30 days
							}).promise();
							fileUpload.variations = fileUpload.variations || [];
							fileUpload.variations.push(imgProcInfo);
						}
					} catch(e) {
						console.error(e);
						fileUpload.status = 'canceled';
						await fileUpload.save();
						throw new H.Error('Could not process the uploaded file.');
					}
				}
				fileUpload.status = 'uploaded';
				await fileUpload.save();

				res.json({success:true, location: 'https://'+fileUpload.bucket+'.s3.amazonaws.com/'+fileUpload.uploadKey});
			} catch(e) {
				console.error(e);
				res.json({success:false, message:e.toString()});
			}
		},

		'/contact'						: async (req, res, urlMatches, method, data) => {
			if(method=='POST') {
				if(!data || !data['g-recaptcha-response'] || typeof data['g-recaptcha-response']!='string')
					throw new H.Error('Could not validate your captcha response.', 400);
				var recaptchaRequest = await H.httpPost('https://www.google.com/recaptcha/api/siteverify', {
					secret		: config.recaptcha.secret,
					response	: data['g-recaptcha-response'],
					remoteip	: '',
				}, undefined, undefined, 'form');

				if(!recaptchaRequest.success)
					throw new H.Error('Could not validate your captcha response.', 400);
				if(typeof data.email!='string' || !data.email.match(H.regexp.email))
					throw new H.Error('Invalid email address!', 400);
				if(typeof data.subject!='string' || data.subject.length<3)
					throw new H.Error('Invalid subject. Please enter a subject at least 3 characters long.', 400);
				if(typeof data.message!='string' || data.message.length<5)
					throw new H.Error('Invalid message. Please enter a valid message to contact us.', 400);

				var emailHtml = await renderEmail('../templates/emails/contact.jinja', {
					subject	: data.subject,
					email	: data.email,
					message	: data.message,
				});
				await sendEmail('_EMAIL_ADDRESS_', data.email, data.subject+' - Contact Form', emailHtml);

				return res.json({success:true, message: 'Your message was successfully sent. We will reply to you as soon as possible.'});
			} else {
				res.end(await renderPage('../templates/pages/contact.jinja', {
					...dftData,
					page	: 'contact',
					title	: 'Contact us - _PROJECT_NAME_',
				}));
			}
		},
		'/login'						: async (req, res, urlMatches, method, data) => {
			if(userAccount)
				return res.writeHead(302, {'Location': '/account'});
			if(method=='POST') {
				var account = await Account.findOne({ email: data.email });

				if(!account)
					throw new H.Error('Could not find the account with the specified email.');

				if(H.sha1(account.passSalt+data.password)==account.passHash) {
					userAccount = account;
					session.userId = account._id;
					session.save();
					return res.json({success:true, message: 'Successfully logged in. Redirecting...'});
				} else
					throw new H.Error('Invalid email/password combination.');
			} else {
				res.end(await renderPage('../templates/account/login.jinja', {
					...dftData,
					page	: 'login',
					title	: 'Login - _PROJECT_NAME_',
				}));
			}
		},
		'/logout'						: async (req, res, urlMatches, method, data) => {
			// TODO
			if(userAccount) {
				session.userId = null;
				await session.save();
				userAccount = undefined;
			}
			return res.writeHead(307, {'Location': '/'});
		},
		'/signup/verificationCode'		: async (req, res, urlMatches, method, data) => {
			if(method=='POST') {
				if(!String(data.email).match(H.regexp.email))
					throw new H.Error('Invalid email address.');
				var account = await Account.findOne({ email: data.email });
				if(account)
					throw new H.Error('An account is already using this email address.');
				account = await Account.findOne({ email: data.email });
				if(account)
					throw new H.Error('An account is already using this email.');

				var verificationCode = String(Math.round(Math.random()*1000000)).padStart(6, '0');
				session.emailVerificationCode = {
					email	: data.email,
					verificationCode,
					expiry	: H.timestamp()+2*3600,
					tries	: 3,
				};
				await session.save();
				var emailHtml = await renderEmail('../templates/emails/emailVerification.jinja', { verificationCode });
				await sendEmail(data.email, undefined, verificationCode+' is your verification code', emailHtml);

				res.json({success:true, message:'A verification code was sent to the email address you have entered.'});
			} else
				throw new H.Error('Invalid request.');
		},
		'/signup'						: async (req, res, urlMatches, method, data) => {
			if(userAccount) {
				return res.writeHead(302, {'Location': '/'});
			}
			if(method=='POST') {
				if(!session.emailVerificationCode || session.emailVerificationCode.email != data.email)
					throw new H.Error('Invalid verification code. Please check the email you have received.');
				if(session.emailVerificationCode.verificationCode!=data.verificationCode) {
					session.emailVerificationCode.tries--;
					if(session.emailVerificationCode.tries==0) {
						delete session.emailVerificationCode;
						session.markModified('emailVerificationCode');
						await session.save();
					}
					throw new H.Error('Invalid verification code. Please check the email you have received.');
				}
				if(session.emailVerificationCode.expiry<H.timestamp()) {
					delete session.emailVerificationCode;
					session.markModified('emailVerificationCode');
					await session.save();
					throw new H.Error('This verification code has expired.');
				}

				var salt = H.uniqueToken();
				var account = new Account({
					name						: data.name,
					email						: data.email,
					confirmedEmail				: false,
					emailConfirmationToken		: H.uniqueToken(),
					passHash					: H.sha1(salt+data.password),
					passSalt					: salt,
					profilePicture				: undefined,
					extras						: {},
				});
				try {
					account = await account.save();
					session.userId = account._id; // Login user
					await session.save();
					res.json({success:true, message:'Account successfully created. Redirecting...', id:account._id});
				} catch(e) {
					console.error(e);
					if(e instanceof Error && e.name=='ValidationError') {
						var msg = '';
						for(let k in e.errors) {
							if(e.errors[k].kind=='unique')
								msg += 'Another account already uses the "'+k+'" you have typed.';
							else
								msg += 'Invalid "'+k+'".';
						}
						return res.json({success:false, message:msg});
					}
					res.json({success:false, message:e.toString()});
				}
			} else {
				res.end(await renderPage('../templates/account/signup.jinja', {
					...dftData,
					page				: 'signup',
					title				: 'Sign Up - _PROJECT_NAME_',
				}));
			}
		},
		'/platform-admin'		: async (req, res, urlMatches, method, data) => {
			await checkAdmin();
			res.end(await renderPage('../templates/admin/home.jinja', {
				...dftData,
				page		: 'platform-admin',
				title		: 'Platform Admin - _PROJECT_NAME_',
				users		: await Account.find({}).limit(20).sort({dateCreated:-1}),
			}));
		},

		'//AFTER_HANDLER'	: async (req, res, method, data) => {
			if(userAccount) {
				userAccount.lastActive = Date.now();
				userAccount.save();
			}
		},
	};





}, {
	beforeHandler	: async (req, res) => {
		res.setHeader('Content-Type', 'text/html; charset=utf-8');
		res.setHeader('X-XSS-Protection', '1; mode=block');
		res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
		res.setHeader('X-Content-Type-Options', 'nosniff');
		res.setHeader('X-Frame-Options', 'deny');
		res.setHeader('Content-Security-Policy', 'block-all-mixed-content; frame-ancestors \'none\'; upgrade-insecure-requests; base-uri \'self\'; form-action \'self\'');
		 // Uncomment if you have Https enabled
		//res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
	},
	onError			: async (err, req, res) => {
		console.error(err);
		if(req) {
			try {
				var code = (err instanceof Error && err.statusCode) || 500;

				if(res.useJSON) {
					if(!res.headersSent)
						res.writeHead(200, {'Content-Type': 'application/json'});
					res.end(JSON.stringify({success:false, message:err.toString()}));
				} else {
					if(!res.headersSent)
						res.writeHead(code, {'Content-Type': 'text/html'});
					res.end(await renderPage('../templates/pages/error.jinja', {
						page	: 'error',
						title	: 'Error '+code+' - _PROJECT_NAME_',
						code	: code,
						message	: err.toString(),
					}));
				}
			} catch(e) {
				res.end('<h1>Error 500</h1><p>'+H.escape(e)+'</p>');
			}
		}
	}
});
console.log('Server loaded!');
