const nodemon = require('nodemon');

nodemon({
  script: 'lib/server.js',
  ext: 'js json',
  ignore: [
    'lib/flows/*',
    'lib/uitemplates/*',
    'nodes_modules',
    '*.test.js',
    '*.json',
  ],
  watch: ['lib/*', '*.js'],
});

nodemon
  .on('start', function() {
    console.log('App has started');
  })
  .on('quit', function() {
    console.log('App has quit');
    process.exit();
  })
  .on('restart', function(files) {
    console.log('App restarted due to: ', files);
  });
