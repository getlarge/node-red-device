# node-red-device

Node-RED project running in local mode, acting as AloesLight device and served by Express

## Usage

```
git clone https://github.com/getlarge/node-red-device.git 
npm install
npm start
```

When running multiple instances in parallel, you can specify a port:

```
npm start -- -p 1885
```
To run a specific flow file:

```
npm start -- testFlow.json
```


To run via Express ( create .env file first ):

```
npm run start:dev
```

## Starting with PM2

```
npm install -g pm2
```

Edit ecosystem.config.js, then

```
pm2 start ecosystem.config.js
```

If you want autorestart

```
pm2 save
pm2 startup
```

