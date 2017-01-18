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

function renderPlainText(text) {
  return format('<pre>%s</pre>', text);
}

function renderImage(fileName, description) {
  return format('<img src="%s" alt="%s"/>', fileName, description.trim());
}

function getFileName() {
  var directory = pluginConfig['directory'];
  var prefix = pluginConfig['prefix'];
  var suffix = Math.random().toString(36).substring(10);

  return format('%s/%s%s.%s', directory, prefix, suffix, IMAGE_TYPE);
}
function createDirectory() {
  var directory = path.join(config.output, pluginConfig['directory']);

  if (!fs.existsSync(directory)) {
    mkdirp(directory);
  }
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

        var deferred = Q.defer();

        var style = block.kwargs['style'] || 'default';
        var description = block.body;

        wsd.diagram(description, style, IMAGE_TYPE, function (er, buf, typ) {
          if (er) {
            console.error(er);
            deferred.reject(renderPlainText(description));
          } else {
            var fileName = getFileName();
            fs.writeFile(path.join(config.output, fileName), buf, {}, function (fileError) {
              if (fileError) {
                console.error(er);
                deferred.reject(renderPlainText(description));
              } else {
                deferred.resolve(renderImage(fileName, description));
              }
            });
          }
        });

        return deferred.promise;
      }
    }
  }

};
