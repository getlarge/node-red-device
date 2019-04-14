const express = require('express');
const dotenv = require('dotenv');
const nodeSetup = require('./node-setup');

const result = dotenv.config();
if (result.error) {
  throw result.error;
}

let httpServer;
const app = express();

app.use('/', express.static('public'));

app.set('url', result.parsed.NODE_RED_URL);
app.set('host', result.parsed.NODE_RED_HOST);
app.set('port', Number(result.parsed.NODE_RED_PORT));

const config = {
  name: result.parsed.DEVICE_NAME,
  httpAdminRoot: result.parsed.NODE_RED_ADMIN_ROOT,
  httpNodeRoot: result.parsed.NODE_RED_API_ROOT,
  uiPath: result.parsed.NODE_RED_UI_PATH,
  userDir: result.parsed.NODE_RED_USER_DIR,
  port: Number(result.parsed.NODE_RED_PORT),
  credentialSecret: result.parsed.NODE_RED_CREDENTIAL_SECRET || null,
  aloesEmail: result.parsed.ALOES_USER_EMAIL || null,
  aloesPassword: result.parsed.ALOES_USER_PASSWORD || null,
};

app.start = () => {
  httpServer = nodeSetup.init(app, config);
  app.emit('started');
};

app.on('started', () => {
  app.get(`${config.httpNodeRoot}/start`, async (req, res) => {
    try {
      // todo : verify req.args.accessToken
      //  nodeSetup.init(app, config);
      //  const state = await nodeSetup.start();
      if (!(await nodeSetup.isStarted())) {
        app.close();
        app.start();
      }
      return res.end();
    } catch (error) {
      console.log('nodered', 'start:err', error);
      return error;
    }
  });

  app.get(`${config.httpNodeRoot}/stop`, async (req, res) => {
    try {
      // verify req.args.accessToken
      const state = await nodeSetup.stop();
      //  return state
      return res.end();
    } catch (error) {
      console.log('nodered', 'stop:err', error);
      return error;
    }
  });
});

app.close = () => {
  app.emit('closed');
  httpServer.close();
};

app.publish = (topic, payload) => {
  app.emit('publish', topic, payload);
};

app.start();

module.exports = app;
