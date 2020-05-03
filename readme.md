# What is this?
Another NodeJS framework.

It aims to be a **SUPER** quick way to spin off a boilerplate web platform.
When installed, it supports:
- A configured *NGINX* server
- Installation and setup of MongoDB
- A *SASS* + *JS* compiler/minifier
- A boilerplate web app
- A Sessions system
- Depends on the `H` (https://www.npmjs.com/package/upperh) library
- Uses Nunjucks (bundled in `H`) for templating
- A User account system
- *Mailgun* integration for transactional emails (email verification for signup)
- An Upload component (uses `uppy` for the frontend and uploads the files to AWS S3 + Supports automatic creation of image variations using `sharp` -- images of different sizes)
- A Jobs server to run tasks asynchronously


# How to install
If you launch it in a "blank" server, you first need to install NodeJS:
```
sudo curl -o- https://raw.githubusercontent.com/ybouane/startup-factory/master/get-node.sh | bash
```

Once node is available you can use NPX to run the startup-factory installation script:
```
sudo npx startup-factory my-app
```

This will create a my-app folder that will contain the boilerplate web app.
