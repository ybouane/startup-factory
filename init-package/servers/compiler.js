const path		= require('path');
const fs		= require('fs');
const util 		= require('util');
const H 		= require('upperh');

const sass 		= util.promisify(require('node-sass').render);
//const minify	= require('babel-minify');
const resolve = f=>path.resolve(__dirname+'/../', f);
const webpack	= require('webpack');

var webpackCompilers = [
	webpack({
		entry	: resolve('./public/js/main.max.js'),
		output	: {
			filename	: 'main.js',
			path		: resolve('./public/js/'),
		},
		target	: 'web',
		cache	: true,
		mode	: 'production'
	})
];

// Watch folders
const scssFolders = [
	resolve('public/css/'),
];
const jsFolders = [
	resolve('public/js/'),
	resolve('helpers/'),
];

try {
	(async () => {

		var timeOutScss = null;
		// SCSS watcher
		const scssParse = (folder) => {
			return (event, file) => {
				timeOutScss && clearTimeout(timeOutScss);
				timeOutScss = setTimeout(async () => {
					if(!/\.scss$/.test(file))
						return;
					console.log(event+': '+path.resolve(folder, file));
					var start = Date.now();
					var css = await H.readFile(path.resolve(folder, file));
					try {
						var importedFiles = [];
						var sassOut = await sass({
							data		: css,
							importer	: (url, prev, done) => {
								var p = path.resolve(prev=='stdin'?folder:path.dirname(prev), url+'.scss');
								console.log(p);
								if(importedFiles.includes(p))
									done({contents : ''});
								else {
									done({file:p});
									importedFiles.push(p);
								}
							},
							outputStyle	: 'compressed'
						});
						await H.writeFile(path.resolve(folder, file.replace(/\.scss$/, '.css')), sassOut.css.toString());
						console.log('Scss file properly parsed and written! Took: '+String(Date.now()-start)+'ms');
					} catch (e) {
						console.error(e);
					}
				}, 800);
			}
		};
		scssFolders.forEach((folder) => {
			fs.watch(folder, {persistent:true}, scssParse(folder));
		})

		// JS Watchers
		var timeOutJs = null;
		// JS watcher
		const jsParse = (folder) => {
			return (event, file) => {
				timeOutJs && clearTimeout(timeOutJs);
				timeOutJs = setTimeout(async () => {
					if(!/\.max\.js/.test(file))
						return;
					console.log(event+': '+path.resolve(folder, file));
					var js = await H.readFile(path.resolve(folder, file));
					try {
						for(let webpackCompiler of webpackCompilers) {
							let start = Date.now();
							webpackCompiler.run((err, stats) => {
								if(stats && stats.compilation.errors && stats.compilation.errors.length>0)
									stats.compilation.errors.forEach(e=>console.error(e));
								else if(err)
									console.error(err);
								else
									console.log('JS file properly parsed and written! Took: '+String(Date.now()-start)+'ms');
							});
						}


					} catch (e) {
						console.error(e);
					}
				}, 800);
			}
		};
		jsFolders.forEach((folder) => {
			fs.watch(folder, {persistent:true}, jsParse(folder));
		})


	})();
} catch (e) {
	console.error(e);
	console.trace();
}
