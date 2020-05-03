#!/usr/bin/env node
'use strict';
const H = require('upperh');
const path = require('path');
const cp = require('child_process');
const cwd = process.cwd();

(async () => {
	try {
		console.log('A');
		var projectName = await H.input('Project Name: (My App) ') || 'My App';
		projectName = projectName.replace(/[\'\"\\]/g, ''); // Sorry, not allowed

		var projectHandle = H.handlize(await H.input('Project Handle: ('+H.handlize(projectName)+') ') || projectName);


		var domainName = await H.input('Domain Name: (localhost) ') || 'localhost';
		domainName = domainName.toLowerCase().replace(/^https?:\/\//, '').replace(/[^a-z0-9_\.-]/g, ''); // Clean domain name value

		var primaryColor = await H.input('Primary Color: (#3498db) ') || '#3498db';
		var secondaryColor = await H.input('Primary Color: (#2c3e50) ') || '#2c3e50';

		var dbPass = (H.uniqueToken()+H.uniqueToken()).substring(0, 24);


		cp.execFileSync(path.join(__dirname, 'install.sh'), [__dirname, projectHandle, dbPass], {
			cwd		: cwd,
			stdio	: 'inherit',
		});
		// TODO: Create mongodb user
		/*db.createUser({
			user: "new_user",
			pwd: "some_password",
			roles: [ { role: "readWrite", db: "new_database" } ]
		});*/

		var toReplace = {
			_PUBLIC_FOLDER_ 	: path.join(cwd, projectHandle, 'public'),
			_DOMAIN_			: domainName,
			_PROJECT_NAME_		: projectName,
			_PROJECT_HANDLE_	: projectHandle,
			_PRIMARY_COLOR_		: primaryColor,
			_SECONDARY_COLOR_	: secondaryColor,
		};
		for(let s in toReplace) {
			let files = await H.exec('find '+projectHandle+'/ "!" -path "*node_modules*" -type f "(" -name "*.js" -o -name "*.conf" -o -name "*.scss" -o -name "*.jinja" -o -name "*.json" ")" -exec grep -l "'+s+'" {} +');
			let s_ = new RegExp(toReplace, 'g');
			for(let file of files) {
				let f = path.join(cwd, projectHandle, file);
				await H.writeFile(f, await H.readFile(f).replace(s_, toReplace[s]))
			}
		}

		// TODO open and replace content of each file with appropriate values

	} catch(e) {
		console.error(e);
	}
})();
