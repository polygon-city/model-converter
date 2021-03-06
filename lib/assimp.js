/**
 * Node.js interface for the Assimp model converter
 * Based partly on the Assimp Node REST API
 * https://github.com/donny-dont/assimp-node-service
 * @author Robin Hawkes - vizicities.com
 */

var debug = require("debug")("modelConverter");
var Q = require("q");
var os = require("os");
var path = require("path");
var process = require("child_process");
var shell = require("shelljs");

var assimpPath = getAssimpPath();

function getAssimpPath() {
  var type = os.type();
  var exePath;

  // Check for system assimp binary
  if (shell.which("assimp")) {
    exePath = "assimp"
    return exePath;
  }

  // Otherwise, fall back to included binary
  if (type == "Darwin") {
    exePath = "osx/assimp";
  }

  if (!exePath) {
    throw new Error("Unable to find an assimp binary");
  }

  return path.join(__dirname, "../bin", exePath);
}

// TODO: Perform validation on input and output file types
// TODO: Return a promise
var convert = function(inputPath, outputPath) {
  var deferred = Q.defer();

  var arguments = [];
  arguments.push("export");
  arguments.push(inputPath);
  arguments.push(outputPath);

  // Perform various optimisation and fixing tasks
  // http://threever.org/assimp/help
  arguments.push("-cfast");

  debug("Starting conversion from " + inputPath);
  debug("Conversion args:", arguments);

  var assimp = process.spawn(assimpPath, arguments, {
    detached: true
  });

  assimp.stdout.on("data", function (data) {
    debug("stdout: " + data);
  });

  assimp.stderr.on("data", function (data) {
    debug("stderr: " + data);
  });

  assimp.on("exit", function (code) {
    if (code == 0) {
      debug("Conversion successful! Saved to " + outputPath);
      deferred.resolve(outputPath);
    } else {
      deferred.reject(new Error("An error occurred during conversion of: " + inputPath));
    }
  });

  return deferred.promise;
};

exports = module.exports = {
  convert: convert
};
