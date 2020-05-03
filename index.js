#!/usr/bin/env node
'use strict';
const H = require('upperh');
const path = require('path');
const fs = require('fs');
const cp = require('child_process');
const cwd = process.cwd();

(async () => {
	try {
		var projectName = await H.input('Project Name: (My App) ') || 'My App';
		projectName = projectName.replace(/[\'\"\\]/g, ''); // Sorry, not allowed

		var projectHandle = H.handlize(await H.input('Project Handle: ('+H.handlize(projectName)+') ') || projectName);


		var domainName = await H.input('Domain Name: (localhost) ') || 'localhost';
		domainName = domainName.toLowerCase().replace(/^https?:\/\//, '').replace(/[^a-z0-9_\.-]/g, ''); // Clean domain name value

		var primaryColor = await H.input('Primary Color: (#3498db) ') || '#3498db';
		var secondaryColor = await H.input('Primary Color: (#2c3e50) ') || '#2c3e50';

		var setupAll = await H.input('Setup whole server [git, nginx, node, pm2, mongodb, node-gyp]? (yes) ') || 'y';
		if(['y', 'yes'].includes(setupAll.toLowerCase()))
			setupAll = 'y';
		else
			setupAll = 'n';

		var dbPass = (H.uniqueToken()+H.uniqueToken()).substring(0, 24);

		var installShell = path.join(__dirname, 'install.sh');
		fs.chmodSync(installShell, 0o755);

		cp.execFileSync('sh', [installShell, __dirname, projectHandle, dbPass, setupAll], {
			cwd		: cwd,
			stdio	: 'inherit',
		});

		var toReplace = {
			_PUBLIC_FOLDER_ 	: path.join(cwd, projectHandle, 'public'),
			_DOMAIN_			: domainName,
			_PROJECT_NAME_		: projectName,
			_PROJECT_HANDLE_	: projectHandle,
			_PRIMARY_COLOR_		: primaryColor,
			_SECONDARY_COLOR_	: secondaryColor,
		};
		for(let s in toReplace) {
			let files;
			try {
				files = (await H.exec('find '+projectHandle+'/ \'!\' -path "*node_modules*" -type f "(" -name "*.js" -o -name "*.conf" -o -name "*.scss" -o -name "*.jinja" -o -name "*.json" ")" -exec grep -l "'+s+'" {} +')).stdout.trim().split(/\r?\n/);
			} catch(e){}
			let s_ = new RegExp(toReplace, 'g');
			for(let file of files) {
				try {
					let f = path.join(cwd, file);
					await H.writeFile(f, (await H.readFile(f)).replace(s_, toReplace[s]))
				} catch(e) {
					console.error('Failed at replacing "'+s+'" in file "'+s+'"');
				}
			}
		}

		var postinstallShell = path.join(__dirname, 'post-install.sh');
		fs.chmodSync(postinstallShell, 0o755);

		cp.execFileSync('sh', [postinstallShell, __dirname, projectHandle, dbPass, setupAll], {
			cwd		: cwd,
			stdio	: 'inherit',
		});

	} catch(e) {
		console.error(e);
	}
})();
