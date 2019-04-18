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

app.authenticate = async (req, res) => {
  try {
    if (!req.headers.authorization || !req.headers['x-access-token']) return false;
    let token = req.headers.authorization || req.headers['x-access-token'];
    const validToken = process.env.NODE_RED_ADMIN_PASSHASH;
    let auth = false;
    if (token === validToken) {
      auth = true;
    }
    if (!auth) {
      res.json({ success: false, response: 'Auth failure' });
      return res.end();
    }
    return auth;
  } catch (error) {
    return error;
  }
};

app.close = () => {
  app.emit('closed');
  httpServer.close();
};

app.publish = (topic, payload) => {
  app.emit('publish', topic, payload);
};

app.on('started', () => {
  app.get(`${config.httpNodeRoot}/start`, async (req, res) => {
    try {
      await app.authenticate(req, res);
      if (!(await nodeSetup.isStarted())) {
        app.close();
        app.start();
        res.json({ success: true, response: 'Node-red started' });
        return res.end();
      }
      //  return res.end();
      res.json({ success: true, response: 'Node-red already started' });
      return res.end();
    } catch (error) {
      console.log('nodered', 'start:err', error);
      return error;
    }
  });

  app.get(`${config.httpNodeRoot}/stop`, async (req, res) => {
    try {
      const auth = await app.authenticate(req);
      if (!auth) {
        res.json({ success: false, response: 'Auth failure' });
        return res.end();
      }
      const state = await nodeSetup.stop();
      //  return state
      res.json({ success: true, response: 'Node-red stopped' });
      return res.end();
    } catch (error) {
      console.log('nodered', 'stop:err', error);
      return error;
    }
  });

  app.get(`${config.httpNodeRoot}/restart`, async (req, res) => {
    try {
      const auth = await app.authenticate(req);
      if (!auth) {
        res.json({ success: false, response: 'Auth failure' });
        return res.end();
      }
      await nodeSetup.stop();
      app.close();
      app.start();
      res.json({ success: true, response: 'Node-red restarted' });
      return res.end();
    } catch (error) {
      console.log('nodered', 'stop:err', error);
      return error;
    }
  });
});

app.start();

module.exports = app;
