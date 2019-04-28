const express = require('express');
const dotenv = require('dotenv');
const localtunnel = require('localtunnel');

const nodeSetup = require('./node-setup');

let httpServer;
let tunnel;

const app = express();

app.use('/', express.static('public'));

app.createTunnel = conf => {
  try {
    const options = { host: conf.tunnel, subdomain: conf.name };
    //  console.log('nodered', 'tunnel:create', options);
    return localtunnel(conf.port, options, (err, res) => {
      if (err) throw err;
      tunnel = res;
      console.log('nodered', 'tunnel:url', tunnel.url);
      return tunnel;
    });
  } catch (error) {
    return error;
  }
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

app.start = async () => {
  try {
    const result = dotenv.config();
    if (result.error) {
      throw result.error;
    }

    const config = {
      name: result.parsed.DEVICE_NAME,
      url: result.parsed.NODE_RED_URL,
      host: result.parsed.NODE_RED_HOST,
      port: Number(result.parsed.NODE_RED_PORT),
      sessionSecret: result.parsed.NODE_RED_SESSION_SECRET,
      httpAdminRoot: result.parsed.NODE_RED_ADMIN_ROOT,
      httpNodeRoot: result.parsed.NODE_RED_API_ROOT,
      uiPath: result.parsed.NODE_RED_UI_PATH,
      username: result.parsed.NODE_RED_USERNAME,
      userPass: result.parsed.NODE_RED_USERPASS || 'test',
      passHash: result.parsed.NODE_RED_PASSHASH,
      userDir: result.parsed.NODE_RED_USER_DIR,
      credentialSecret: result.parsed.NODE_RED_CREDENTIAL_SECRET || null,
      aloesEmail: result.parsed.ALOES_USER_EMAIL || null,
      aloesPassword: result.parsed.ALOES_USER_PASSWORD || null,
    };

    app.set('url', config.url);
    app.set('host', config.host);
    app.set('port', config.port);

    if (config.tunnel && (!tunnel || !tunnel.url)) {
      await app.createTunnel(config);
      //  tunnel = await app.createTunnel(config);
    }

    httpServer = await nodeSetup.init(app, config);
    if (httpServer && httpServer !== null) {
      return app.emit('started', config);
    }
    return app.close();
  } catch (error) {
    return error;
  }
};

app.close = () => {
  app.emit('closed');
  if (tunnel) {
    tunnel.close();
  }
  if (httpServer) {
    httpServer.close();
  }
};

app.publish = (topic, payload) => {
  app.emit('publish', topic, payload);
};

app.on('started', () => {
  // node red admin api
  app.get(`${conf.httpNodeRoot}/start`, async (req, res) => {
    try {
      const auth = await app.authenticate(req, res);
      if (!auth) {
        res.status(403);
        res.json({ success: false, response: 'Auth failure' });
        return res.end();
      }
      if (!(await nodeSetup.isStarted())) {
        app.close();
        app.start();
        res.status(200);
        res.json({ success: true, response: 'Node-red started' });
        return res.end();
      }
      res.status(200);
      res.json({ success: true, response: 'Node-red already started' });
      return res.end();
    } catch (error) {
      console.log('nodered', 'start:err', error);
      return error;
    }
  });

  app.get(`${conf.httpNodeRoot}/stop`, async (req, res) => {
    try {
      const auth = await app.authenticate(req, res);
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

  app.get(`${conf.httpNodeRoot}/restart`, async (req, res) => {
    try {
      const auth = await app.authenticate(req, res);
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
      console.log('nodered', 'restart:err', error);
      return error;
    }
  });

  // localtunnel events
  tunnel.on('error', err => {
    //  console.log('nodered', 'tunnel:err', err);
    tunnel.close();
  });

  tunnel.on('close', () => {
    console.log('nodered', 'tunnel:closed');
    // setTimeout restart tunnel
  });
});

app.start();

module.exports = app;
