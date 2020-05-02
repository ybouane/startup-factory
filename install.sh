pwd
echo -n "Project Name: "
read appName

echo -n "Git repo url: "
read repo

echo -n "Setup whole server [git, nginx, node, pm2, mongodb, node-gyp]? (yes) "
read setupAll

exit;

title() {
#	clear
	echo "-------------------------------------"
	echo "$1"
	echo "-------------------------------------"
}
if [[ $setupAll = 'y' || $setupAll = 'yes' || $setupAll = 'YES' || $setupAll = 'Y' ]]; then
	title "Installing Devleopment Tools"
	sudo yum install -y make glibc-devel gcc gcc-c++ patch

	title "Installing Git"
	sudo yum install -y git

	title "Updating packages"
	sudo yum update -y

	source ~/.bashrc

	npm install -g node-gyp

	title "Installing Nginx"
	sudo yum install -y nginx
	sudo systemctl enable nginx # auto load when server boots

	title "Installing PM2"
	npm install pm2@latest -g
	PM2_STARTUP_COMMAND=`pm2 startup | tail -1`
	eval "$PM2_STARTUP_COMMAND"

	# Disable access to EC2 meta-data service for non-root users:
	sudo iptables -A OUTPUT -m owner ! --uid-owner root -d 169.254.169.254 -j DROP
fi


mkdir $appName
cd $appName

npm init
git init
git remote add origin $repo
git pull

title "Installing npm dependencies"
npm install aws-sdk cookie mailgun-js mongodb mongoose mongoose-unique-validator node-sass sharp upperh webpack --save


# TODO copy package
title "Copying package"



title "Starting Servers via PM2"
cd servers
pm2 start *.json
pm2 save
cd ../



if [[ $setupAll = 'y' || $setupAll = 'yes' || $setupAll = 'YES' || $setupAll = 'Y' ]]; then
	title "Starting NGINX"
	sudo systemctl start nginx
fi
