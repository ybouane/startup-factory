title() {
	echo -e "\e[44m-------------------------------------"
	echo -e "\e[44m--- $1 ---"
	echo -e "\e[44m-------------------------------------\e[49m"
}

rootDir="$1"
projectHandle="$2"
dbPass="$3"
setupAll="$4"


source ~/.bashrc

title "Starting Servers via PM2"
cd $projectHandle
cd servers
pm2 start *.json
pm2 save
cd ../


if [[ $setupAll == 'y' ]]; then


	sudo ln config/nginx.conf /etc/nginx/conf.d/$projectHandle.conf
	title "Starting NGINX"
	sudo systemctl start nginx
	sudo systemctl enable nginx
fi



echo -n "Setup automatic SSL certificates w/ Certbot ? (no) "
read installCertbot
if [[ -z "$installCertbot" || "$installCertbot" == 'y' || "$installCertbot" == 'yes' || "$installCertbot" == 'Y' || "$installCertbot" == 'YES' || "$installCertbot" == 'Yes' ]]; then
	cd ../
	# Install EPEL repo
	curl -O http://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
	sudo yum install epel-release-latest-7.noarch.rpm
	rm epel-release-latest-7.noarch.rpm
	sudo yum -y install yum-utils
	sudo yum-config-manager --enable rhui-REGION-rhel-server-extras rhui-REGION-rhel-server-optional

	# Install Certbot
	sudo yum install certbot python2-certbot-nginx

	# Run Certbot
	sudo certbot --nginx

	# Enable automatic renewal through cron
	echo "0 0,12 * * * root python -c 'import random; import time; time.sleep(random.random() * 3600)' && certbot renew -q" | sudo tee -a /etc/crontab > /dev/null

fi
