const _constants = require('../../config/safeConstants');

window.dataLayer = window.dataLayer || [];
window.gtag = function(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'UA-156065557-1');


class Controller {
	constructor() {

	}
	get _constants() {
		return _constants;
	}

	escape(str) {
		return String(str)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
	}
	delay(time) {
		return new Promise(function(resolve, reject) {setTimeout(resolve, time);});
	}
	hasOwnProp(obj, k) {
		return Object.prototype.hasOwnProperty.call(obj, k);
	}
	setLoader(loading) {
		if(loading)
			$('html').attr('is-loading', '');
		else
			$('html').removeAttr('is-loading');
	}

	openLoginForm(message) {
		$('#loginPopup').find('h2').text(message);
		$('html').attr('login-popup', '')
	}

	openDialog(html, buttons, callback, extraClasses='') {
		// TODO implement btn.cancel (ESC button) & danger button
		var $dialog = $(
			`<dialog class="${this.escape(extraClasses)}">
				<form method="dialog">
					<div class="dialog-content">${html}</div>
					<menu>
						${buttons.map(
							btn => {
								return '<button value="'+this.escape(btn.value)+'" '+(btn.default?'type="submit"':'type="button"')+' class="'+(btn.shallow?'shallow':'')+' '+(btn.critical?'critical':'')+'">'+this.escape(btn.text)+'</button>';
							}
						).join('')}
					</menu>
				</form>
			</dialog>`
		).appendTo(document.body);
		var close = () => {
			$dialog.remove();
			$('html').removeAttr('dialog-open');
		};
		$dialog.on('click', 'menu>button', function(e) {
			callback($(e.target).attr('value'), close);
		}).attr('open', '').find('form').on('submit', function(e) {
			e.preventDefault();
			e.stopPropagation();
		});
		$('html').attr('dialog-open', '');

		return $dialog;
	}

	deserializeForm($ele, data) {
		for(let [k, v] of Object.entries(data)) {
			var $f = $ele.find('[name="'+k+'"]');
			if($f.is('input[type="checkbox"]')) {
				$f.prop('checked', v);
			} else if($f.is('[is-uploader]')) {
				// not implemented, must be passed during uppy initialization
			} else if($f.is('radios')) {
				if(!Array.isArray(v))
					continue;
				$f.find('radio').each(function(){
					if(v.includes($(this).attr('data-value')))
						$(this).attr('data-selected', '');
				});
			} else if($f.is(':input')) {
				$f.val(v);
			}
		}
	}
	serializeForm($ele) {
		var formObj = {};
		$ele.find('[name]').each(function() {
			var $this = $(this);
			if(!$this.attr('name'))
				return;
			if($this.is('input[type="checkbox"]')) {
				formObj[$this.attr('name')] = $this.is(':checked');
			} else if($this.is('[is-uploader]')) {
				var uppy = $this.triggerHandler('getUppy');
				var files =  uppy.getFiles();
				if(files.find(f=>!f.progress.uploadComplete))
					throw 'UNFINISHED_UPLOADS';

				if(uppy.opts.allowMultipleUploads)
					formObj[$this.attr('name')] = files.map(f=>f.s3Multipart.key);
				else
					formObj[$this.attr('name')] = files[0] && files[0].s3Multipart && files[0].s3Multipart.key;
			} else if($this.is('radios')) {
				formObj[$this.attr('name')] = $this.find('radio[data-selected]').map(function(){return $(this).attr('data-value')}).get();
			} else if($this.is(':input')) {
				formObj[$this.attr('name')] = $this.val();
			}
		});
		return formObj;
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
		var $msg = $('<div data-type="'+this.escape(type)+'">'+this.escape(message).replace(/\r?\n/g, '<br />')+'</div>').appendTo('info-messages');
		await this.delay(duration);
		$msg.addClass('hidden');
		await this.delay(1000);
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
				$(target).attr('is-uploader', '').on('getUppy', function() {
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
					let preview = 'https://_DOMAIN_/images/fileIcons/unknown.svg';
					if(f.public && ['jpg', 'jpeg', 'png', 'gif'].includes(f.format))
						preview = 'https://'+f.bucket+'.s3.amazonaws.com/'+f.uploadKey;
					/*else if (['csv', 'jpeg', 'jpg', 'json', 'mp4', 'png', 'txt', 'xls', 'xlsx', 'xml', 'zip'].includes(f.format))
						preview = 'https://_DOMAIN_/images/fileIcons/'+f.format+'.svg';*/

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
			if($('#uppyScript').length==0) {
				$('head').append('<link href="https://transloadit.edgly.net/releases/uppy/v1.10.1/uppy.min.css" rel="stylesheet">');
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
			if(payload instanceof jQuery)
				payload = this.serializeForm(payload);
			method = method.toLowerCase();
			var qs = method=='get'?Object.keys(payload).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(payload[k])).join('&'):'';
			var response = await fetch(endpoint+(qs?'?'+qs:''), {
				method		: method,
				headers		: {
					'Content-Type'	: 'application/json',
					'Accept'		: 'application/json',
				},
				cache		: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
				credentials	: 'same-origin',
				...(method=='get' || method=='head'?
					{}
				:
					{body : JSON.stringify(payload)}
				),
				...opts
			});
			if(response.ok) {
				var output;
				try {
					output = await response.json(); // Expect all responses to be in JSON format
				} catch(e) {
					throw new Error('The server returned an invalid response.');
				}
				if(output.success) {
					delete output.success;
					if(!opts.ignoreLoader)
						this.setLoader(false);
					if(output.message) {
						this.showSuccess(output.message);
					}
					return output;
				} else if(output.errorMessage)
					throw new Error(output.errorMessage);
				else if(output.message)
					throw new Error(output.message);
				else
					throw new Error('The server returned an invalid response.');
			} else {
				if(response.status != 200)
					throw new Error('Error '+response.status+(response.statusText?': '+response.statusText:''));
				else
					throw new Error('A network error occured.');
			}
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

	var MarkdownIt = window.markdownit();

	$(document).on('parsePlugins', function() {
		$('radios').on('click', 'radio', function() {
			var $this = $(this);
			var max = $this.parent().attr('max-selections') || 0;
			if($this.is('[data-selected]'))
				$this.removeAttr('data-selected', '');
			else {
				$this.attr('data-selected', '');
				if(max) {
					$this.parent().find('radio[data-selected]').not($this).slice(max-1).removeAttr('data-selected');
				}
			}
		});
		$('.markdown:not([is-parsed])').each(function() {
			$(this).html(MarkdownIt.render($(this).text().trim())).attr('is-parsed', '');
			$(this).find('a').attr('target', '_blank');

		});
		$('icon[submit]').on('click', function() {
			$(this).closest('form').trigger('submit');
		});
		$('field>label:not([for])').each(function() {
			var $inp = $(this).nextAll(':input');
			if($inp) {
				if(!$inp.attr('id'))
					$inp.attr('id', 'field-input-'+Math.round(Math.random()*100000));
				$(this).attr('for', $inp.attr('id'));
			}
		});
	});
	$(document).ready(function() {
		$(document).trigger('parsePlugins');
		$('#loginPopup').on('submit', async (e) => {
			e.preventDefault();
			try {
				await controller.apiPost('/login', $('#loginPopup'));
				controller.setLoader(true);
				location.reload(true);
			} catch(e) {}
		}).on('reset', function() {
			$('html').removeAttr('login-popup')
		});
		
		$('mobile-nav .close').on('click', function() {
			$('mobile-nav').removeClass('open');
		});
		$('header .mobile-open').on('click', function() {
			$('mobile-nav').addClass('open');
		})
	});

})();
