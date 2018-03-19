var Q = require('q');
var mkdirp = require('mkdirp');
var fs = require('fs');
var path = require('path');
var format = require('util').format;
var wsd = require('websequencediagrams');
var console = require('console');

var book, config, pluginConfig;

// A subscription is required for PDF or SVG
var IMAGE_TYPE = 'png';

function createDirectory() {
  var directory = path.join(config.output, pluginConfig['directory']);

  if (!fs.existsSync(directory)) {
    mkdirp(directory);
  }
}

function generateFilePath() {
  var directory = pluginConfig['directory'];
  var imagePrefix = pluginConfig['image-prefix'];
  var suffix = Math.random().toString(36).substring(10);

  return format('%s/%s%s.%s', directory, imagePrefix, suffix, IMAGE_TYPE);
}

function getDiagramData(definition, style) {
  return Q.Promise(function (resolve, reject) {
    wsd.diagram(definition, style, IMAGE_TYPE, function (error, buffer, type) {
      if (error) {
        reject(new Error(error));
      } else {
        resolve(buffer, type);
      }
    })
  });
}

function writeImage(buffer) {
  return Q.Promise(function (resolve, reject) {
    var relativePath = generateFilePath();

    fs.writeFile(path.join(config.output, relativePath), buffer, {}, function (error) {
      if (error) {
        reject(new Error(error));
      } else {
        resolve(relativePath);
      }
    })
  });
}

function renderPlainText(text) {
  return Q.resolve(format('<pre>%s</pre>', text));
}

function renderImage(filePath, definition) {
  return Q.Promise(function (resolve) {
    var diagramTitleExp = /(title )(.*?\n)/i;
    var match = definition.match(diagramTitleExp);
    var altText = match == null || match.length < 3 ? '' : match[2].trim();
    resolve(format('<img src="%s" alt="%s"/>', filePath, altText));
  });
}

module.exports = {
  hooks: {
    "init": function () {
      // Gitbook 2.x. In 3.x this will be this.config
      config = this.options;
      book = this;

      pluginConfig = config.pluginsConfig['websequencediagrams-generator'];

      createDirectory();
    }
  },
  blocks: {
    websd: {
      process: function (block) {
        var definition = block.body;
        var style = block.kwargs['style'] || 'default';

        return getDiagramData(definition, style)
          .then(writeImage)
          .then(function (filePath) {
            return renderImage(filePath, definition);
          }).catch(function (error) {
            console.error("An error is thrown, will render the websequencediagram as plain text", error);
            return renderPlainText(definition);
          });
      }
    }
  }
};