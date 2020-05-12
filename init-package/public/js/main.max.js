const H = require('upperh');
const MarkdownIt = require('markdown-it');
const _constants = require('../../config/safeConstants');

window.H = H;

window.dataLayer = window.dataLayer || [];
window.gtag = function(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'UA-XXXXX');



class Controller {
	constructor() {

	}
	get _constants() {
		return _constants;
	}

	setLoader(loading) {
		if(loading)
			H('html').attr('is-loading', '');
		else
			H('html').removeAttr('is-loading');
	}

	openLoginForm(message) {
		H('#loginPopup').find('h2').text(message);
		H('html').attr('login-popup', '')
	}

	openDialog(html, buttons, callback, extraClasses='') {
		// TODO implement btn.cancel (ESC button) & danger button
		var $dialog = H(
			`<dialog class="${H.escape(extraClasses)}">
				<form method="dialog">
					<div class="dialog-content">${html}</div>
					<menu>
						${buttons.map(
							btn => {
								return '<button value="'+H.escape(btn.value)+'" '+(btn.default?'type="submit"':'type="button"')+' class="'+(btn.shallow?'shallow':'')+' '+(btn.critical?'critical':'')+'">'+H.escape(btn.text)+'</button>';
							}
						).join('')}
					</menu>
				</form>
			</dialog>`
		).appendTo(document.body);
		var close = () => {
			$dialog.remove();
			H('html').removeAttr('dialog-open');
		};
		$dialog.on('click', 'menu>button', function(e) {
			callback(H(e.target).attr('value'), close);
		}).attr('open', '').find('form').on('submit', function(e) {
			e.preventDefault();
			e.stopPropagation();
		});
		H('html').attr('dialog-open', '');

		return $dialog;
	}

	deserializeForm($ele, data) {
		var dataFlat = {};
		var scanObj = (prefix, obj) => {
			for(let [k, v] of Object.entries(obj)) {
				if(H.isObject(v))
					scanObj(prefix+k+'.', v);
				else
					dataFlat[prefix+k] = v;
			}
		}
		scanObj('', data);
		for(let [k, v] of Object.entries(dataFlat)) {
			var $f = $ele.find('[name="'+k+'"]');
			if($f.is('input[type="checkbox"]')) {
				$f.prop('checked', v);
			} else if($f.is('[is-uploader]')) {
				// not implemented, must be passed during uppy initialization
			} else if($f.is('radios')) {
				if(!H.isArray(v))
					v = [v];
				$f.find('radio').each(function(){
					if(v.includes(H(this).attr('data-value')))
						H(this).attr('data-selected', '');
				});
			} else if($f.is('input, select, textarea')) {
				$f.val(v);
			}
			$f.trigger('change');
		}
	}
	serializeForm($ele) {
		var formObj = {};
		$ele.find('[name]').each(function() {
			if(!this.attr('name'))
				return;
			if(this.is('input[type="checkbox"]')) {
				formObj[this.attr('name')] = this.is(':checked');
			} else if(this.is('[is-uploader]')) {
				var uppy = this.triggerHandler('getUppy');
				var files =  uppy.getFiles();
				if(files.find(f=>!f.progress.uploadComplete))
					throw 'UNFINISHED_UPLOADS';

				if(uppy.opts.allowMultipleUploads)
					formObj[this.attr('name')] = files.map(f=>f.s3Multipart.key);
				else
					formObj[this.attr('name')] = files[0] && files[0].s3Multipart && files[0].s3Multipart.key;
			} else if(this.is('radios')) {
				if(this.attr('max-selections'))
					formObj[this.attr('name')] = this.find('radio[data-selected]').map(function(){return H(this).attr('data-value')}).get();
				else
					formObj[this.attr('name')] = this.find('radio[data-selected]').attr('data-value');
			} else if(this.is('input[type="number"]')) {
				formObj[this.attr('name')] = parseFloat(this.val());
			} else if(this.is('input, select, textarea')) {
				formObj[this.attr('name')] = this.val();
			}
		});
		var output = {};
		for(let [k,v] of Object.entries(formObj))
			H.setVariable(output, k, v);
		return output;
	}

	AWSUploader(uploader) {
		return {
			limit			: 4,
			createMultipartUpload	: async (file) => {
				return await controller.apiPost('/uploader/createMultipartUpload', { uploader, file }, {ignoreLoader:true});
			},
			prepareUploadPart		: async (file, {uploadId, key, body, number}) => {
				return await controller.apiPost('/uploader/prepareUploadPart', { uploader, file, uploadId, key, number }, {ignoreLoader:true});
			},
			listParts				: async (file, {uploadId, key}) => {
				return await controller.apiPost('/uploader/listParts', { uploader, file, uploadId, key }, {ignoreLoader:true});
			},
			abortMultipartUpload	: async (file, {uploadId, key}) => {
				return await controller.apiPost('/uploader/abortMultipartUpload', { uploader, file, uploadId, key }, {ignoreLoader:true});
			},
			completeMultipartUpload	: async (file, {uploadId, key, parts}) => {
				return await controller.apiPost('/uploader/completeMultipartUpload', { uploader, file, uploadId, key, parts }, {ignoreLoader:true});
			}
		};
	}
	async showSuccess(message, duration) {
		return await this.showMessage(message, 'success', duration);
	}
	async showError(message, duration) {
		return await this.showMessage(message, 'error', duration);
	}
	async showInfo(message, duration) {
		return await this.showMessage(message, 'info', duration);
	}
	async showMessage(message, type='info', duration=4000) {
		var $msg = H('<div data-type="'+H.escape(type)+'">'+H.escape(message).replace(/\r?\n/g, '<br />')+'</div>').appendTo('info-messages');
		await H.delay(duration);
		$msg.addClass('hidden');
		await H.delay(1000);
		$msg.remove();
	}


	async setupUppy(target, uploader, preloadFiles=[], opts={}) {
		return new Promise((resolve, reject) => {
			if(preloadFiles==null)
				preloadFiles = [];
			preloadFiles = Array.isArray(preloadFiles)?preloadFiles:[preloadFiles];
			var cb = () => {
				var uppyObj = Uppy.Core({
					autoProceed		: true,
					restrictions	: opts.restrictions || {
						maxFileSize				: 3*1024*1024*1024,
						minNumberOfFiles 		: 1,
						maxNumberOfFiles 		: 1,
						allowedFileTypes 		: ['jpg', 'jpeg', 'png', 'gif'].map(e=>'.'+e),
					},
					allowMultipleUploads	: opts.allowMultipleUploads,
					...(opts.onBeforeFileAdded?{onBeforeFileAdded : opts.onBeforeFileAdded}:{}),
				});
				H(target).attr('is-uploader', '').on('getUppy', function() {
					return uppyObj;
				});
				uppyObj.use(Uppy.Dashboard/*DragDrop*/, {
					target					: target,
					inline					: true,
					replaceTargetContent	: true,
					showProgressDetails		: true,
					height					: 200,
					browserBackButtonClose	: true,
					...opts.dashboard,
				});
				uppyObj.use(Uppy.AwsS3Multipart, this.AWSUploader(uploader));


				for(let f of preloadFiles) {
					let preview = 'https://ticket19.com/images/fileIcons/unknown.svg';
					if(f.public && ['jpg', 'jpeg', 'png', 'gif'].includes(f.format))
						preview = 'https://'+f.bucket+'.s3.amazonaws.com/'+f.uploadKey;
					/*else if (['csv', 'jpeg', 'jpg', 'json', 'mp4', 'png', 'txt', 'xls', 'xlsx', 'xml', 'zip'].includes(f.format))
						preview = 'https://ticket19.com/images/fileIcons/'+f.format+'.svg';*/

					uppyObj.addFile({
						name		: f.originalName, // file name
						//type		: {}[f.format] || '', // file type
						extension	: f.format,
						data: {
							size	: f.size,
						},
						progress: { uploadComplete: true, uploadStarted: false },
						preview		: preview,
						source		: 'remote', // optional, determines the source of the file, for example, Instagram
						isRemote	: true // optional, set to true if actual file is not in the browser, but on some remote server, for example, when using companion in combination with Instagram
					});
				}
				uppyObj.getFiles().forEach((file, i) => {
					file.s3Multipart = {
						key	: preloadFiles[i].uploadKey,
					};
					uppyObj.setFileState(file.id, {
						progress: { uploadComplete: true, uploadStarted: true },
					});
				});
				resolve(uppyObj);
			};
			if(H('#uppyScript').length==0) {
				H('head').append('<link href="https://transloadit.edgly.net/releases/uppy/v1.10.1/uppy.min.css" rel="stylesheet">');
				var scr = document.createElement('script');
				scr.onload = cb;
				scr.src = 'https://transloadit.edgly.net/releases/uppy/v1.10.1/uppy.min.js';
				scr.onerror = reject;
				scr.id = 'uppyScript';
				document.body.appendChild(scr);
			} else
				cb();
		});
	}

	async apiGet() {
		return await this.apiCall('get', ...arguments);
	}
	async apiPost() {
		return await this.apiCall('post', ...arguments);
	}
	async apiPut() {
		return await this.apiCall('put', ...arguments);
	}
	async apiDelete() {
		return await this.apiCall('delete', ...arguments);
	}
	async apiCall(method, endpoint, payload={}, opts={}) {
		try {
			if(!opts.ignoreLoader)
				this.setLoader(true);
			if(payload instanceof H.HObject)
				payload = this.serializeForm(payload);

			var output = await H.httpRequest(method, endpoint, payload, {
				'Content-Type'	: 'application/json',
				'Accept'		: 'application/json',
			}, opts, 'json', 'json');

			if(output.success) {
				delete output.success;
				if(!opts.ignoreLoader)
					this.setLoader(false);
				if(output.message) {
					this.showSuccess(output.message);
				}
				return output;
			} else if(output.message)
				throw new Error(output.message);
			else
				throw new Error('An unexpected error occurred.');
		} catch(e) {
			if(e instanceof Error)
				this.showError(e.message || e.toString());
			else
				this.showError(e.toString());
			if(!opts.ignoreLoader)
				this.setLoader(false);
			throw e;
			//throw new Error('A network error occured.');
		}
	}
};

(async () => {

	var controller = new Controller();
	window.controller = controller;

	H(document).on('parsePlugins', function() {
		H('radios').on('click', 'radio', function() {
			var max = this.parent().attr('max-selections');
			if(!max) {
				if(!this.is('[data-selected]'))
					this.attr('data-selected', '').siblings().removeAttr('data-selected');
			} else {
				if(this.is('[data-selected]'))
					this.removeAttr('data-selected', '');
				else {
					this.attr('data-selected', '');
					if(max) {
						this.parent().find('radio[data-selected]').filter(e=>e!=this[0]).slice(max-1).removeAttr('data-selected');
					}
				}
			}
			this.closest('radios').trigger('change');
		}).each(function(){
			if(this.attr('data-value'))
				this.children('[data-value="'+H.escape(this.attr('data-value'))+'"]').trigger('click');
		});
		H('input[data-prefix], input[data-suffix]').each(function() {
			var $wrapper = this.wrap('<input-wrap></input-wrap>').parent();
			if(this.is('[data-prefix]'))
				H('<span></span>').text(this.attr('data-prefix')).prependTo($wrapper);
			if(this.is('[data-suffix]'))
				H('<span></span>').text(this.attr('data-suffix')).appendTo($wrapper);
		});
		H('.markdown:not([is-parsed])').each(function() {
			this.html(MarkdownIt.render(this.text().trim())).attr('is-parsed', '');
			this.find('a').attr('target', '_blank');
		});
		H('icon[submit]').on('click', function() {
			this.closest('form').trigger('submit');
		});
		H('field>label:not([for])').each(function() {
			var $inp = this.nextAll('input, select, textarea');
			if($inp) {
				if(!$inp.attr('id'))
					$inp.attr('id', 'field-input-'+Math.round(Math.random()*100000));
				this.attr('for', $inp.attr('id'));
			}
		});
		H('input[type="number"]').on('change', function() {
			var step = parseFloat(this.attr('step')) || 1;
			var signif = (String(step).split('.')[1] || '').length;
			var min = parseFloat(this.attr('min'));
			if(isNaN(min) || typeof min != 'number')
				min = -Infinity;
			var max = parseFloat(this.attr('max'));
			if(isNaN(max) || typeof max != 'number')
				max = +Infinity;
			this.val(Math.max(min, Math.min(max, step*Math.round((parseFloat(this.val()) || 0)/step))).toFixed(signif));
		});

		H('[slide-up-down]').on('slideDown', function() {
			if(this.is('[is-closed]')) {
				this.removeAttr('is-closed').attr('transition-finished', '');
				this.css('--slide-height', this[0].offsetHeight+'px');
				this.attr('is-closed', '').removeAttr('transition-finished');
				this[0].offsetHeight;
				this.removeAttr('is-closed');
			}
		}).on('slideUp', function() {
			if(!this.is('[is-closed]')) {
				this.css('--slide-height', this[0].offsetHeight+'px');
				this.removeAttr('transition-finished');
				this[0].offsetHeight;
				this.attr('is-closed', '');
			}
		}).on('slideToggle', function() {
			this.trigger(this.is('[is-closed]')?'slideDown':'slideUp');
		}).on('transitionend', function(e) {
			if(e.target==this[0] && e.propertyName=='max-height')
				this.attr('transition-finished', '');
		}).attr('transition-finished', '').each(function(){
			this.css('--slide-height', this[0].offsetHeight+'px');
		});

	});
	H(function() {
		H(document).trigger('parsePlugins');
		H('#loginPopup').on('submit', async (e) => {
			e.preventDefault();
			try {
				await controller.apiPost('/login', H('#loginPopup'));
				controller.setLoader(true);
				location.reload(true);
			} catch(e) {}
		}).on('reset', function() {
			H('html').removeAttr('login-popup')
		});

		H('mobile-nav .close').on('click', function() {
			H('mobile-nav').removeClass('open');
		});
		H('header .mobile-open').on('click', function() {
			H('mobile-nav').addClass('open');
		})
	});

})();
