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

app.set('url', result.parsed.HTTP_SERVER_URL);
app.set('host', result.parsed.HOST);
app.set('port', Number(result.parsed.PORT));

const config = {
  name: result.parsed.NODE_NAME,
  httpAdminRoot: result.parsed.NODE_RED_ADMIN_ROOT,
  httpNodeRoot: result.parsed.NODE_RED_API_ROOT,
  userDir: result.parsed.NODE_RED_USER_DIR,
  port: Number(result.parsed.PORT),
  aloesEmail: result.parsed.ALOES_USER_EMAIL,
  aloesPassword: result.parsed.ALOES_USER_PASSWORD,
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

app.close = function() {
  app.emit('closed');
  httpServer.close();
};

app.publish = (topic, payload) => {
  app.emit('publish', topic, payload);
};

app.start();

module.exports = app;
