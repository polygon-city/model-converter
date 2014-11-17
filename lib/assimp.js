/**
 * Node.js interface for the Assimp model converter
 * Based partly on the Assimp Node REST API
 * https://github.com/donny-dont/assimp-node-service
 * @author Robin Hawkes - vizicities.com
 */

var os = require("os");
var path = require("path");
var process = require("child_process");

var assimpPath = getAssimpPath();

function getAssimpPath() {
  var type = os.type();
  var exePath;
  
  if (type == "Windows_NT") {
    exePath = "win32/assimp.exe";
  } else if (type == "Darwin") {
    exePath = "osx/assimp";
  } else {
    // Assume linux
    exePath = "linux/assimp";
  }
  
  return path.join(__dirname, "../bin", exePath);
}

// TODO: Perform validation on input and output file types
var convert = function(inputPath, outputPath) {
  var arguments = [];
  arguments.push("export");
  arguments.push(inputPath);
  arguments.push(outputPath);

  console.log("Starting conversion from " + inputPath);

  var assimp = process.spawn(assimpPath, arguments);
          
  assimp.stdout.on("data", function (data) {
    console.log("stdout: " + data);
  });

  assimp.stderr.on("data", function (data) {
    console.log("stderr: " + data);
  });

  assimp.on("exit", function (code) {
    if (code == 0) {
      console.log("Conversion successful!");
      console.log("Output saved to " + outputPath)
    } else {
      console.error("An error occurred during conversion");
    }
  });
};

exports = module.exports = {
  convert: convert
};