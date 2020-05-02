const path = require('path');
const cp = require('child_process');

const rootDir = path.join(__dirname, '..');

cp.execSync(
	'sh '+__dirname+'/install.sh',
	{
		cwd		: rootDir,
		stdio	: 'inherit',
	}
);
