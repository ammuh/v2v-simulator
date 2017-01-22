var num_inputs = 2; // 9 eyes, each sees 3 numbers (wall, green, red thing proximity)
var num_actions = 2; // 5 possible angles agent can turn
var temporal_window = 1; // amount of temporal memory. 0 = agent lives in-the-moment :)
var network_size = num_inputs*temporal_window + num_actions*temporal_window + num_inputs;

// the value function network computes a value of taking any of the possible actions
// given an input state. Here we specify one explicitly the hard way
// but user could also equivalently instead use opt.hidden_layer_sizes = [20,20]
// to just insert simple relu hidden layers.
var layer_defs = [];
layer_defs.push({type:'input', out_sx:1, out_sy:1, out_depth:network_size});
layer_defs.push({type:'fc', num_neurons: 100, activation:'relu'});
layer_defs.push({type:'fc', num_neurons: 100, activation:'relu'});
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
opt.epsilon_test_time = 0.05;
opt.layer_defs = layer_defs;
opt.tdtrainer_options = tdtrainer_options;

var brain = new deepqlearn.Brain(num_inputs, num_actions, opt); // woohoo

// var env = {};
// env.getNumStates = function() { return 2; }
// env.getMaxNumActions = function() { return 2; }
//
// // create the DQN agent
// var spec = {}
// spec.update = 'qlearn'; // qlearn | sarsa
// spec.gamma = 0.9; // discount factor, [0, 1)
// spec.epsilon = 0.8; // initial epsilon for epsilon-greedy policy, [0, 1)
// spec.alpha = 0.005; // value function learning rate
// spec.experience_add_every = 5; // number of time steps before we add another experience to replay memory
// spec.experience_size = 10000; // size of experience
// spec.learning_steps_per_iteration = 5;
// spec.tderror_clamp = 1.0; // for robustness
// spec.num_hidden_units = 100 // number of neurons in hidden layer
//
// var agent = new RL.DQNAgent(env, spec);
var psID;

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
    psID = setInterval(function() { // start the learning loop
        var a = genRand(0, 1);
        var b = genRand(0, 1);
        var inputs = [a, b];
        // console.log("inputs", a, b);


        // var action = agent.act(inputs);
        var action = brain.forward(inputs);

        var reward = 0;

        if (inputs[action] == xor(a, b)) {
            reward = 1;
        } else {
            reward = -3;
        }

        brain.backward(reward);
        // agent.learn(reward); // <-- learning magic happens here
    }, 0);

    console.log(psID);
}

function stopLearning() {
    clearInterval(psID);
}

function testLearning(num_tests) {
    var correct = 0;

    for (var i = 0; i < num_tests; i++) {
        var a = genRand(0, 1);
        var b = genRand(0, 1);
        var inputs = [a, b];

        // var predInd = agent.act(inputs);
        var predInd = brain.forward(inputs);

        var prediction = inputs[predInd];

        if (prediction == xor(a, b)) {
            correct++;
        }
    }

    return Math.round((correct / num_tests) * 100) + "%";
}

// reinforce:
//  1. no collisions (-2)
//  2. get closer to destination (-1)
//  reward of +1 if behaving well
