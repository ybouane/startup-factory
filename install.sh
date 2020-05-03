rootDir="$1"
projectHandle="$2"
dbPass="$3"

echo $rootDir
echo $projectHandle
echo $dbPass

echo -n "Git repo url: "
read repo

echo -n "Setup whole server [git, nginx, node, pm2, mongodb, node-gyp]? (yes) "
read setupAll


title() {
#	clear
	echo -e "\e[44m-------------------------------------"
	echo -e "\e[44m--- $1 ---"
	echo -e "\e[44m-------------------------------------"
}
if [[ $setupAll = '' || $setupAll = 'y' || $setupAll = 'yes' || $setupAll = 'YES' || $setupAll = 'Y' ]]; then
	title "Installing Devleopment Tools"
	sudo yum install -y make glibc-devel gcc gcc-c++ patch

	title "Installing Git"
	sudo yum install -y git

	title "Updating packages"
	sudo yum update -y

	source ~/.bashrc

	npm install -g node-gyp

	title "Installing Nginx"
	sudo amazon-linux-extras install nginx1
	sudo systemctl enable nginx # auto load when server boots

	title "Installing PM2"
	npm install pm2@latest -g
	PM2_STARTUP_COMMAND=`pm2 startup | tail -1`
	eval "$PM2_STARTUP_COMMAND"


	title "Installing MongoDb"
	sudo cp $1/mongodb.repo /etc/yum.repos.d/mongodb-org-4.2.repo

	sudo yum install -y mongodb-org

	sudo systemctl start mongod
	sudo systemctl enable mongod

	sudo mongo --eval "db.createUser({user: '$projectHandle',pwd: '$dbPass',roles: [ { role: 'readWrite', db: '$projectHandle' } ]})"

	# Disable access to EC2 meta-data service for non-root users:
	sudo iptables -A OUTPUT -m owner ! --uid-owner root -d 169.254.169.254 -j DROP
fi


mkdir $projectHandle
cd $projectHandle

npm init
git init
git remote add origin $repo
git pull

title "Installing npm dependencies"
npm install aws-sdk cookie mailgun-js mongodb mongoose mongoose-unique-validator node-sass sharp upperh webpack --save


title "Copying package"

cp -RTn $rootDir/init-package/ ./

#find . "!" -path "*node_modules*" -type f "(" -name "*.js" -o -name "*.scss" -o -name "*.jinja" -o -name "*.json" ")" -exec sed -i '' s/_DOMAIN_/$domainName/g {} +
#find . "!" -path "*node_modules*" -type f "(" -name "*.js" -o -name "*.scss" -o -name "*.jinja" -o -name "*.json" ")" -exec sed -i '' s/_PROJECT_NAME_/$projectName/g {} +



title "Starting Servers via PM2"
cd servers
pm2 start *.json
pm2 save
cd ../



if [[ $setupAll = 'y' || $setupAll = 'yes' || $setupAll = 'YES' || $setupAll = 'Y' ]]; then
	title "Starting NGINX"
	sudo systemctl start nginx
fi
