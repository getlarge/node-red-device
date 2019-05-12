import express from 'express';
import nodeRed from './node-setup';
import tunnel from './tunnel';

const app = express();

app.use('/', express.static('public'));
app.use(express.urlencoded({ extended: false }));

const unless = (paths, redirect) => {
  return (req, res, next) => {
    if (paths.some(p => req.path.indexOf(p) > -1)) {
      return next();
    }
    return res.redirect(redirect);
  };
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
    // if (!auth) {
    //   res.json({ success: false, response: 'Auth failure' });
    //   return res.end();
    // }
    return auth;
  } catch (error) {
    return error;
  }
};

app.start = async config => {
  try {
    console.log('server', 'start');
    if (config.tunnel) {
      await tunnel.init(app, config);
    }
    await nodeRed.init(app, config);

    app.emit('started', config);
    // node red admin api
    app.get(`/start`, async (req, res) => {
      try {
        const auth = await app.authenticate(req, res);
        if (!auth) {
          res.status(403);
          res.json({ success: false, response: 'Auth failure' });
          return res.end();
        }
        if (!(await nodeRed.isStarted())) {
          await app.stop();
          await app.init();
          res.status(200);
          res.json({ success: true, response: 'Node-red-device restarted' });
          return res.end();
        }
        res.status(200);
        res.json({ success: true, response: 'Node-red-device already started' });
        return res.end();
      } catch (error) {
        console.log('nodered', 'start:err', error);
        return error;
      }
    });

    app.get(`/stop`, async (req, res) => {
      try {
        const auth = await app.authenticate(req, res);
        if (!auth) {
          res.json({ success: false, response: 'Auth failure' });
          return res.end();
        }
        const state = await nodeRed.stop();
        //  return state
        res.json({ success: true, response: 'Node-red stopped' });
        return res.end();
      } catch (error) {
        console.log('nodered', 'stop:err', error);
        return error;
      }
    });

    app.get(`/restart`, async (req, res) => {
      try {
        const auth = await app.authenticate(req, res);
        if (!auth) {
          res.json({ success: false, response: 'Auth failure' });
          return res.end();
        }
        await nodeRed.stop();
        await app.stop();
        await app.init();
        res.json({ success: true, response: 'Node-red-device restarted' });
        return res.end();
      } catch (error) {
        console.log('nodered', 'restart:err', error);
        return error;
      }
    });

    return app;
  } catch (error) {
    console.log('server', 'start:err', error);
    return error;
  }
};

app.publish = (topic, payload) => {
  app.emit('publish', topic, payload);
};

/**
 * Close the app and services
 * @method module:Server.stop
 */
app.stop = async signal => {
  try {
    console.log('server', 'stop', signal);
    app.emit('stopped', signal);
    let exit = await nodeRed.stop();
    if (app.tunnel) {
      exit = await tunnel.stop(app);
    }
    console.log('exit', exit);
    return true;
  } catch (error) {
    console.log('server', 'stop:err', error);
    return error;
  }
};

/**
 * Bootstrap the application, configure models, datasources and middleware.
 * @method module:Server.init
 * @param {object} config - Parsed env variables
 */
app.init = config => {
  try {
    console.log('server', 'init', `${config.NODE_NAME} / ${config.NODE_ENV}`);

    const formattedConf = {
      name: config.DEVICE_NAME,
      url: config.NODE_RED_URL,
      host: config.NODE_RED_HOST,
      port: Number(config.NODE_RED_PORT),
      httpAdminRoot: config.NODE_RED_ADMIN_ROOT,
      httpNodeRoot: config.NODE_RED_API_ROOT,
      uiPath: config.NODE_RED_UI_PATH,
      username: config.NODE_RED_USERNAME,
      userPass: config.NODE_RED_USERPASS || 'test',
      passHash: config.NODE_RED_PASSHASH,
      userDir: config.NODE_RED_USER_DIR,
      sessionSecret: config.NODE_RED_SESSION_SECRET || 'very secret secret',
      credentialSecret: config.NODE_RED_CREDENTIAL_SECRET || null,
      aloesEmail: config.ALOES_USER_EMAIL || null,
      aloesPassword: config.ALOES_USER_PASSWORD || null,
      aloesHost: config.ALOES_HTTP_HOST,
      aloesPort: Number(config.ALOES_HTTP_PORT),
      tunnel: config.TUNNEL_URL,
    };

    const routes = [
      'start',
      'stop',
      'restart',
      formattedConf.httpAdminRoot,
      formattedConf.httpNodeRoot,
    ];

    app.set('originUrl', formattedConf.url);
    app.set('url', formattedConf.url);
    app.set('host', formattedConf.host);
    app.set('port', formattedConf.port);

    app.use('/', unless(routes, `${formattedConf.httpNodeRoot}/${formattedConf.uiPath}`));

    return app.start(formattedConf);
  } catch (error) {
    console.log('server', 'init:err', error);
    return error;
  }
};

export default app;
