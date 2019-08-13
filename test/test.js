const gpwg = require('../index');

// Current directory (needs to be set to emulate the config from gitbook)
const baseDir = '.';
// Directory to save images
const outputDir = 'testoutput';

// Configuration for the test setup
gpwg.hooks.options = {
  output: baseDir,
  pluginsConfig: {
    'websequencediagrams-generator': {
      directory: outputDir,
      'image-prefix': 'test-image-'
    }
  }
};

// Initialises the plugin
gpwg.hooks.init();

const block = {
  body: `title Authentication Sequence

Alice->Bob: Authentication Request
note right of Bob: Bob thinks about it
Bob->Alice: Authentication Response
`,
  kwargs: {style: 'default'}
};

// Process the fragment
gpwg.blocks.websd.process(block);