const RED = require('node-red');
const http = require('http');
const bcrypt = require('bcryptjs');

const nodeRed = {};

nodeRed.init = async (app, conf) => {
  try {
    const server = http.createServer(app);
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
      //  httpNodeCors: {
      //    origin: "*",
      //    methods: "GET,PUT,POST,DELETE"
      //},
      //  disableEditor: false,
      // todo : Use passport middleware to validate requests.
      //  httpNodeMiddleware: function(req,res,next) {
      //   // Handle/reject the request, or pass it on to the http in node
      //   // by calling next();
      //   next();
      //},
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

    if (conf.credentialSecret !== null) {
      settings.credentialSecret = conf.credentialSecret;
    }

    await RED.init(server, settings);
    app.use(settings.httpAdminRoot, RED.httpAdmin);
    app.use(settings.httpNodeRoot, RED.httpNode);
    if (conf.name) {
      // also need the entry in /etc/hosts
      server.listen(port, `${conf.name}.local`, 34);
    } else {
      server.listen(port);
    }
    await nodeRed.start();

    console.log(
      'nodered',
      'init',
      `${conf.name || 'Node-red'} admin listening @: ${port}${settings.httpAdminRoot}`,
    );
    console.log(
      'nodered',
      'init',
      `${conf.name || 'Node-red'} node listening @: ${port}${settings.httpNodeRoot}`,
    );

    return server;
  } catch (error) {
    return error;
  }
};

nodeRed.isStarted = async () => {
  try {
    const started = await RED.runtime.isStarted();
    console.log('nodered', 'is started ?', `${started}`);
    if (!!started) {
      return true;
      //  await RED.start();
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
    //  }
    return false;
  } catch (error) {
    return false;
  }
};

nodeRed.stop = async () => {
  try {
    if (await nodeRed.isStarted()) {
      await RED.runtime.stop();
      //  await RED.stop();
      //  console.log('end nodes', RED.nodes);
    }
    return true;
  } catch (error) {
    return error;
  }
};

module.exports = nodeRed;
