title "Installing NVM"
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
. ~/.nvm/nvm.sh

echo "=== Installing NodeJS + NPM ==="
#nvm install v13.13.0
nvm install node

source ~/.bashrc
