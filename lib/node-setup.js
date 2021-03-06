import bcrypt from 'bcryptjs';
import basicAuth from 'express-basic-auth';
import session from 'express-session';
import http from 'http';
import https from 'https';
import RED from 'node-red';
import externalModules from './external-modules';

const nodeRed = {};
let users = {};
let httpServer;

nodeRed.login = (options, data) =>
  new Promise((resolve, reject) => {
    let httpClient = http;
    if (options.port === 443) {
      httpClient = https;
    }
    const req = httpClient.request(options, (res) => {
      console.log('LOGIN STATUS: ' + res.statusCode);
      //  console.log('HEADERS: ' + JSON.stringify(res.headers));
      const bodyChunks = [];
      res
        .on('data', (chunk) => {
          bodyChunks.push(chunk);
        })
        .on('end', () => {
          try {
            const body = Buffer.concat(bodyChunks);
            console.log('BODY: ', body.toString());
            const token = JSON.parse(body);
            if (!token || !token.id) {
              resolve(false);
            }
            resolve(token);
          } catch (e) {
            reject(e);
            //  resolve(false);
          }
          //  reject(new Error('invalid response'));
        });
    });

    req.on('error', (e) => {
      reject(e);
    });
    req.write(data);
    req.end();
  });

nodeRed.isStarted = async () => {
  const started = await RED.runtime.isStarted();
  console.log('nodered', 'is started ?', `${started}`);
  if (!!started) {
    return true;
  }
  return false;
};

nodeRed.start = async (conf) => {
  try {
    console.log('nodered', 'start');
    if (!(await nodeRed.isStarted())) {
      await RED.start();
    }

    console.log(
      'nodered',
      `${conf.name || 'Node-red'} admin listening @: ${conf.port}${conf.httpAdminRoot}
      node listening @: ${conf.port}${conf.httpNodeRoot}
      access UI from ${conf.httpNodeRoot}/${conf.uiPath}`,
    );
    return httpServer;
    //  return false;
  } catch (error) {
    console.log('nodered', 'start:err', error);
    throw error;
  }
};

nodeRed.stop = async () => {
  try {
    console.log('nodered', 'stop');
    await RED.runtime.stop();
    httpServer.close();
    return true;
  } catch (error) {
    console.log('nodered', 'stop:err', error);
    throw error;
  }
};

nodeRed.init = async (app, conf) => {
  try {
    console.log('nodered', 'init');
    httpServer = await http.createServer(app);
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
      contextStorage: {
        default: conf.storeType || 'memoryOnly',
        memoryOnly: { module: 'memory' },
        file: { module: 'localfilesystem' },
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

    const loadedModules = externalModules(conf);
    if (loadedModules && Object.keys(loadedModules).length > 0) {
      Object.keys(loadedModules).forEach(
        (key) => (settings.functionGlobalContext[key] = loadedModules[key]),
      );
    }

    const aloesAuthorizer = async (username, password, cb) => {
      try {
        if (!username || !password) return cb(null, false);
        if (users && users[username]) {
          return cb(null, true);
        }
        const options = {
          host: conf.aloesHost,
          port: conf.aloesPort,
          path: '/api/users/login',
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        };
        const creds = JSON.stringify({
          email: username,
          password,
        });
        const token = await nodeRed.login(options, creds);
        if (token) {
          // if (token.userId is in admin team) cb true
          users[username] = { username, token: token.id, userId: token.userId };
          console.log('authorizer token', token);
          return cb(null, true);
        }
        return cb(null, false);
      } catch (error) {
        return cb(null, false);
      }
    };

    const authorizer = async (username, password, cb) => {
      try {
        if (!username || !password) return cb(null, false);
        if (users && users[username]) {
          const userMatches = basicAuth.safeCompare(username, users[username].name);
          const passwordMatches = basicAuth.safeCompare(password, users[username].password);
          //  return userMatches & passwordMatches;
          return cb(null, userMatches & passwordMatches);
        }
        return cb(null, false);
      } catch (error) {
        console.log('authorizer error', error);
        return cb(null, false);
      }
    };

    const getUnauthorizedResponse = (req) => {
      //  console.log('getUnauthorizedResponse', req.session, req.auth);
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

    const aloesAuthenticate = basicAuth({
      challenge: true,
      authorizer: aloesAuthorizer,
      authorizeAsync: true,
      unauthorizedResponse: getUnauthorizedResponse,
      //  realm: 'Imb4T3st4pp',
    });

    const authenticate = basicAuth({
      challenge: true,
      authorizer: authorizer,
      authorizeAsync: true,
      unauthorizedResponse: getUnauthorizedResponse,
    });

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
      users[conf.username] = { name: conf.username, password: conf.userPass };
    }
    if (conf.credentialSecret !== null) {
      settings.credentialSecret = conf.credentialSecret;
    }

    await RED.init(httpServer, settings);
    app.use(
      settings.httpNodeRoot,
      session({
        name: conf.name,
        resave: false,
        saveUninitialized: false,
        secret: conf.sessionSecret,
        cookie: { maxAge: 60000 },
      }),
    );

    if (conf.httpNodeAuth === 'basic') {
      app.use(settings.httpNodeRoot, authenticate);
    } else if (conf.httpNodeAuth === 'aloes') {
      app.use(settings.httpNodeRoot, aloesAuthenticate);
    }

    app.use(settings.httpAdminRoot, RED.httpAdmin);
    app.use(settings.httpNodeRoot, RED.httpNode);
    httpServer.listen(port);
    await nodeRed.start(conf);
    return httpServer;
  } catch (error) {
    console.log('nodered', 'init:err', error);
    throw error;
  }
};

export default nodeRed;
