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

function getFileName() {
  var directory = pluginConfig['directory'];
  var prefix = pluginConfig['prefix'];
  var suffix = Math.random().toString(36).substring(10);

  return format('%s/%s%s.%s', directory, prefix, suffix, IMAGE_TYPE);
}

function getDiagramData(description, style) {
  return Q.Promise(function (resolve, reject) {
    wsd.diagram(description, style, IMAGE_TYPE, function (error, buffer, type) {
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
    var fileName = getFileName();
    fs.writeFile(path.join(config.output, fileName), buffer, {}, function (error) {
      if (error) {
        reject(new Error(error));
      } else {
        resolve(fileName);
      }
    })
  });
}

function renderPlainText(text) {
  return Q.resolve(format('<pre>%s</pre>', text));
}

function renderImage(fileName, description) {
  var diagramTitleExp = new RegExp(/(title )(.*?\n)/, 'i');
  var match = description.match(diagramTitleExp);
  var altText = match == null || match.length < 3 ? '' : match[2].trim();
  return Q.resolve(format('<img src="%s" alt="%s"/>', fileName, altText));
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
        var description = block.body;
        var style = block.kwargs['style'] || 'default';

        return getDiagramData(description, style)
          .then(writeImage)
          .then(function (fileName) {
            return renderImage(fileName, description);
          }).catch(function (error) {
            console.error(error);
            return renderPlainText(description);
          });
      }
    }
  }
};