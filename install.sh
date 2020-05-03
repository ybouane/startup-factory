title() {
	echo -e "\e[44m-------------------------------------\e[49m"
	echo -e "\e[44m--- $1 ---\e[49m"
	echo -e "\e[44m-------------------------------------\e[49m"
}

rootDir="$1"
projectHandle="$2"
dbPass="$3"
setupAll="$4"

echo -n "Git repo url: "
read repo



if [[ $setupAll = 'y' ]]; then
	title "Installing Devleopment Tools"
	sudo yum install -y make glibc-devel gcc gcc-c++ patch

	title "Installing Git"
	sudo yum install -y git

	title "Updating packages"
	sudo yum update -y

	source ~/.bashrc

	title "Installing Node-gyp"
	npm install -g node-gyp

	title "Installing Nginx"
	sudo amazon-linux-extras install nginx1 -y

	title "Installing PM2"
	npm install pm2@latest -g
	PM2_STARTUP_COMMAND=`pm2 startup | tail -1`
	eval "$PM2_STARTUP_COMMAND"


	title "Installing MongoDb"
	sudo cp $1/mongodb.repo /etc/yum.repos.d/mongodb-org-4.2.repo

	sudo yum install -y mongodb-org


	sudo mongo --eval "db.createUser({user: '$projectHandle',pwd: '$dbPass',roles: [ { role: 'readWrite', db: '$projectHandle' } ]})"

	# Disable access to EC2 meta-data service for non-root users:
	sudo iptables -A OUTPUT -m owner ! --uid-owner root -d 169.254.169.254 -j DROP
fi


mkdir $projectHandle
cd $projectHandle

git init
if [[ ! $repo = '' ]]; then
	git remote add origin $repo
	git pull
fi

title "NPM init"
npm init

title "Installing npm dependencies"
npm install aws-sdk cookie mailgun-js mongodb mongoose mongoose-unique-validator node-sass sharp upperh webpack --save


title "Copying package"

cp -RTn $rootDir/init-package/ ./

title "Replacing placeholders in Package template"
