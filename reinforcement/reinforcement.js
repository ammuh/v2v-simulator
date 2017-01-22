// var num_inputs = 32 * 3 + 4;
// var num_actions = 32 + 1;
// var num_inputs = 2;
// var num_actions = 2;

var temporal_window = 1;
var network_size = num_inputs*temporal_window + num_actions*temporal_window + num_inputs;

// the value function network computes a value of taking any of the possible actions
// given an input state. Here we specify one explicitly the hard way
// but user could also equivalently instead use opt.hidden_layer_sizes = [20,20]
// to just insert simple relu hidden layers.
var layer_defs = [];
layer_defs.push({type:'input', out_sx:1, out_sy:1, out_depth:network_size});
layer_defs.push({type:'fc', num_neurons: 50, activation:'relu'});
layer_defs.push({type:'fc', num_neurons: 50, activation:'relu'});
layer_defs.push({type:'fc', num_neurons: 50, activation:'relu'});
layer_defs.push({type:'regression', num_neurons:num_actions});

// options for the Temporal Difference learner that trains the above net
// by backpropping the temporal difference learning rule.
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

var brain = new deepqlearn.Brain(num_inputs, num_actions, opt); // woohoo

var psID;
var eps;

var outputs = [0, 1];

function xor(a , b) {
    return (a && !b) || (!a && b);
}

function calcReward(positions, hadCollision) {
    var reward = 0;

    if (hadCollision) {
        reward -= 2;
    }

    var oldPosition = positions.old;
    var newPosition = positions.new;
    var destination = positions.destination;

    var oldDistance = PathGraph.distance(oldPosition[0], oldPosition[1], destination[0], destination[1]);
    var newDistance = PathGraph.distance(newPosition[0], newPosition[1], destination[0], destination[1]);

    if (oldDistance < newDistance) {
        reward -= 1;
    } else if (newDistance < oldDistance) {
        reward = 1;
    }

    return reward;
}

function genRand(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function startLearning() {
    brain.learning = true;

    psID = setInterval(function() { // start the learning loop
        if (brain.epsilon_test_time >= 0) {
            brain.epsilon_test_time -= 0.001;
        }

        var a = genRand(0, 1);
        var b = genRand(0, 1);
        var inputs = [a, b];
        // console.log("inputs", a, b);


        // var action = agent.act(inputs);
        var action = brain.forward(inputs);

        var reward = 0;

        if (outputs[action] == xor(a, b)) {
            reward = 1;
        } else {
            reward = -1;
        }

        brain.backward(reward);
        // agent.learn(reward); // <-- learning magic happens here
    }, 0);

    //console.log(psID);
}

function stopLearning() {
    clearInterval(psID);
    brain.learning = false;
}

function testLearning(num_tests) {
    stopLearning();

    var correct = 0;

    for (var i = 0; i < num_tests; i++) {
        var a = genRand(0, 1);
        var b = genRand(0, 1);
        var inputs = [a, b];

        // var predInd = agent.act(inputs);
        var predInd = brain.forward(inputs);

        var prediction = outputs[predInd];

        if (prediction == xor(a, b)) {
            correct++;
        }
    }

    startLearning();

    return Math.round((correct / num_tests) * 100) + "%";
}

// reinforce:
//  1. no collisions (-2)
//  2. get closer to destination (-1)
//  reward of +1 if behaving well
