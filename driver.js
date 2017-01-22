var slines;
/*
	e.data = {
		train: null or {
			position: {
				oldPosition: [x, y],
				newPosition: [x, y],
				destination: [x, y]
			},
			hadCollision: bool
		},
		fibers:[
			{
				clear: 1,0
				distance:
				rad:
				speed:
			}
		],
		partFiber:
		speed:
		distToNode:
		nodeFiber:
		rewards:{
			dist:
			collision:
		}
	}
*/

var window = {};

importScripts("./stage.js");
importScripts("./reinforcement/convnet.js");
importScripts("./reinforcement/util.js");
importScripts("./reinforcement/vis.js");
importScripts("./reinforcement/deepqlearn.js");

var fiberPredictor = {
	num_inputs: 32 * 2 + 4,
	num_actions: 32
}

var temporal_window = 1;
var network_size = fiberPredictor.num_inputs*temporal_window + fiberPredictor.num_actions*temporal_window + fiberPredictor.num_inputs;

var layer_defs = [];
layer_defs.push({type:'input', out_sx:1, out_sy:1, out_depth:network_size});
layer_defs.push({type:'fc', num_neurons: 50, activation:'relu'});
layer_defs.push({type:'fc', num_neurons: 50, activation:'relu'});
layer_defs.push({type:'fc', num_neurons: 50, activation:'relu'});
layer_defs.push({type:'regression', num_neurons: fiberPredictor.num_actions});

var tdtrainer_options = {learning_rate:0.01, momentum:0.0, batch_size:64, l2_decay:0.01};

var opt = {};
opt.temporal_window = temporal_window;
opt.experience_size = 30000;
opt.start_learn_threshold = 1000;
opt.gamma = 0.7;
opt.learning_steps_total = 200000;
opt.learning_steps_burnin = 3000;
opt.epsilon_min = 0;
opt.epsilon_test_time = 0.51;
opt.layer_defs = layer_defs;
opt.tdtrainer_options = tdtrainer_options;

fiberPredictor.opt = opt;

var fibers = new deepqlearn.Brain(fiberPredictor.num_inputs, fiberPredictor.num_actions, fiberPredictor.opt);

var psID = null;
var eps;

onmessage = function(e) {
	// var fib = e.data.partFiber;
	// var s= 0;
	// if(e.data.partFiber == 0){
	// 	for(var i = 0; i < e.data.fibers.length; i++){
	// 		if(e.data.fibers[i].clear == true){
	// 			fib = i;
	// 			s = 2;
	// 			break;
	// 		}
	// 	}
	// }

	if (e.data.train != null) {
		if (e.data.train.position.destination == null) {
			return;
		}

		var reward = calcReward(e.data.train.position, e.data.train.hadCollision);
		fibers.backward(reward);
	} else {
		startLearning(e);
	}
}

function calcReward(position, hadCollision) {
	var reward = 0;

	if (hadCollision) {
		reward -= 2;
	}

	var oldPosition = position.oldPosition;
	var newPosition = position.newPosition;
	var destination = position.destination;

	var oldDistance = PathGraph.distance(oldPosition[0], oldPosition[1], destination[0], destination[1]);
	var newDistance = PathGraph.distance(newPosition[0], newPosition[1], destination[0], destination[1]);

	if (oldDistance < newDistance) {
		reward -= 1;
	} else if (newDistance < oldDistance) {
		reward = 1;
	}

	return reward;
}

function startLearning(e) {
	fibers.learning = true;

	if (fibers.epsilon_test_time >= 0) {
		fibers.epsilon_test_time -= 0.0001;
	}

	var inputs = [];
	for (var i = 0; i < e.data.fibers.length; i++) {
		inputs.push(e.data.fibers[i].clear);
		inputs.push(e.data.fibers[i].distance);
	}
	inputs.push(e.data.partFiber);
	inputs.push(e.data.distToNode);
	inputs.push(e.data.nodeFiber);
	inputs.push(e.data.speed);

	var action = fibers.forward(inputs);

	var controllerMatrix = {
		speed: 1,
		fiber: action
	};
	postMessage(controllerMatrix);
}

function stopLearning() {
	clearInterval(psID);
	fibers.learning = false;
}

function testLearning(num_tests) {
	if (psID != null) {
		stopLearning();
	}

	var correct = 0;

	for (var i = 0; i < num_tests; i++) {
		var inputs = [a, b];

		var predInd = fibers.forward(inputs);

		var prediction = outputs[predInd];

		if (prediction == xor(a, b)) {
			correct++;
		}
	}

	startLearning();

	return Math.round((correct / num_tests) * 100) + "%";
}
