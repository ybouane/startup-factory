# What is this?
Another NodeJS framework.

It aims to be a **SUPER** quick way to spin off a boilerplate web platform.
In literally minutes, it installs the tech stack and will save you

When installed, it integrates:
- A boilerplate web app
- A configured *NGINX* server
- Installation and setup of MongoDB
- A *SASS* + *JS* compiler/minifier
- A sessions system (cookies)
- Depends on the `H` (https://www.npmjs.com/package/upperh) library
- Uses Nunjucks (bundled in `H`) for templating
- A User account system
- Uses the `PM2` process manager to automatically watch and restart servers when modifications are done or on a reboot
- *Mailgun* integration for transactional emails (email verification for signup)
- An Upload component (uses `uppy` for the frontend and uploads the files to AWS S3 + Supports automatic creation of image variations using `sharp` -- images of different sizes)
- A Jobs server to run tasks asynchronously
- Support for automatic SSL certificates through Certbot (Let's Encrypt)
- An HTML/JS/SCSS boiletplate template

# How to install
**It was optimized to work on Amazon Linux 2**

If you launch it in a "blank" server, you first need to install NodeJS:
```
sudo curl -o- https://raw.githubusercontent.com/ybouane/startup-factory/master/get-node.sh | bash
source ~/.bashrc
```

Once node is available you can use NPX to run the startup-factory installation script:
```
npx startup-factory
```

This will create a my-app folder that will contain the boilerplate web app.


# Future
I made this tool for my own personal needs. It could easily be adapted and work with different tech stacks in the future. (Maybe being able to choose between preconfigured stacks)

Right now, the technologies and APIs it integrates are:
AWS + NGINX + PM2 + NodeJS + MongoDB + H + jQuery + SASS + Uppy + Mailgun + Certbot + Stripe (not by default) + reCaptcha
