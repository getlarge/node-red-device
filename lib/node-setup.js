const session = require('express-session');
const basicAuth = require('express-basic-auth');
const RED = require('node-red');
const http = require('http');
const bcrypt = require('bcryptjs');

const nodeRed = {};
let users = {};

const authorizer = (username, password) => {
  //  console.log('authorizer', username, password);
  if (users && users.username) {
    const userMatches = basicAuth.safeCompare(username, users.username.name);
    const passwordMatches = basicAuth.safeCompare(password, users.username.password);
    return userMatches & passwordMatches;
  }
  return false;
};

const getUnauthorizedResponse = req => {
  console.log('getUnauthorizedResponse', req.session, req.auth);
  if (req.auth) {
    req.session.regenerate(() => {
      req.session.user = req.auth.user;
      req.session.success = `Authenticated as ${req.auth.user}`;
    });
  } else {
    req.session.error = 'Authentication failed, please check your username and password.';
  }
};

const restrict = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect(`login`);
  }
};

const authenticate = basicAuth({
  challenge: true,
  authorizer: authorizer,
  unauthorizedResponse: getUnauthorizedResponse,
});

nodeRed.isStarted = async () => {
  try {
    const started = await RED.runtime.isStarted();
    console.log('nodered', 'is started ?', `${started}`);
    if (!!started) {
      return true;
    }
    return false;
  } catch (error) {
    return error;
  }
};

nodeRed.start = async () => {
  try {
    if (!(await nodeRed.isStarted())) {
      await RED.start();
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

nodeRed.stop = async () => {
  try {
    if (await nodeRed.isStarted()) {
      await RED.runtime.stop();
    }
    return true;
  } catch (error) {
    return error;
  }
};

nodeRed.init = async (app, conf) => {
  try {
    const server = await http.createServer(app);
    let port = conf.port || 8000;
    let userDir = conf.userDir || './';
    const settings = {
      httpAdminRoot: conf.httpAdminRoot || '/red',
      httpNodeRoot: conf.httpNodeRoot || '/',
      ui: { path: conf.uiPath || 'ui' },
      userDir,
      nodesDir: conf.nodesDir || `${userDir}.config.json`,
      flowFile: conf.flowFile || `${userDir}flows.json`,
      flowFilePretty: true,
      functionGlobalContext: {
        processEnv: process.env,
      },
      paletteCategories: [
        'subflows',
        'aloes',
        'input',
        'output',
        'function',
        'social',
        'mobile',
        'storage',
        'analysis',
        'advanced',
      ],
      //  disableEditor: false,
    };

    if (conf.aloesEmail !== null && conf.aloesPassword !== null) {
      const adminPassHash = bcrypt.hashSync(conf.aloesPassword, 8);
      process.env.NODE_RED_ADMIN_PASSHASH = adminPassHash.toString();
      settings.adminAuth = {
        type: 'credentials',
        users: [
          {
            username: conf.aloesEmail,
            password: adminPassHash.toString(),
            permissions: '*',
          },
        ],
      };
    }
    if (conf.username && conf.username !== null && conf.userPass && conf.userPass !== null) {
      users.username = { name: conf.username, password: conf.userPass };
    }
    if (conf.credentialSecret !== null) {
      settings.credentialSecret = conf.credentialSecret;
    }

    await RED.init(server, settings);
    app.use(
      session({
        name: conf.name,
        resave: false, 
        saveUninitialized: false,
        secret: conf.sessionSecret,
        cookie: { maxAge: 60000 },
      }),
    );
    app.use(settings.httpNodeRoot, authenticate);
    app.use(settings.httpAdminRoot, RED.httpAdmin);
    app.use(settings.httpNodeRoot, RED.httpNode);
    server.listen(port);
    await nodeRed.start();

    console.log(
      'nodered',
      `${conf.name || 'Node-red'} admin listening @: ${port}${settings.httpAdminRoot}
      node listening @: ${port}${settings.httpNodeRoot}
      access UI from ${conf.httpNodeRoot}/${conf.uiPath}`,
    );
    return server;
  } catch (error) {
    return error;
  }
};

module.exports = nodeRed;
