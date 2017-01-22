// var $ = require("jquery");
// var pixi = require("pixi.js");
// var convnet = require("./reinforcement/convnet.js");
// var util = require("./reinforcement/util.js");
// var vis = require("./reinforcement/vis.js");
// var deepqlearn = require("./reinforcement/deepqlearn.js");
// var rl = require("./reinforcement/rl.js");
// var stage = require("./stage");
// var bootstrap = require("./bootstrap");
// var particle = require("./particle");
// var main = require("./main");
// var reinforce = require("./reinforcement/reinforcement");

var vm = require("vm");
var fs = require("fs");

var loadData = function(path, context) {
    var data = fs.readFileSync(path);
    vm.runInNewContext(data, context, path);
}
global.document = require('jsdom').jsdom();
global.window = document.defaultView;
global.window.document = global.document;

global.Canvas = require('canvas');
global.Image = require('canvas').Image;

// Node canvas Image's dont currently have `addEventListener` so we fake it for now.
// We can always make updates to the node-canvas lib
global.Image.prototype.addEventListener = function(event, fn) {
    const img = this;

    switch (event) {
        case 'error':
            img.onerror = function() {
                img.onerror = null;
                img.onload = null;
                fn.call(img);
            };
            break;

        case 'load':
            img.onload = function() {
                img.onerror = null;
                img.onload = null;
                fn.call(img);
            };
            break;
    }
};

global.Image.prototype.removeEventListener = function() {};
global.navigator = { userAgent: 'node.js' }; // could be anything

loadData("./node_modules/pixi.js/dist/pixi.min.js", global);
loadData("./reinforcement/convnet.js", global);
loadData("./reinforcement/util.js", global);
loadData("./reinforcement/vis.js", global);
loadData("./reinforcement/deepqlearn.js", global);
loadData("./reinforcement/rl.js", global);
loadData("./stage.js", global);
loadData("./bootstrap.js", global);
loadData("./particle.js", global);
loadData("./main.js", global);
loadData("./reinforcement/reinforcement.js", global);

startLearning();

setInterval(function() {
    console.log(testLearning(50));
}, 5000);
