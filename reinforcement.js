var env = {};
env.getNumStates = function() { return 2; }
env.getMaxNumActions = function() { return 1; }

// create the DQN agent
var spec = {}
spec.update = 'qlearn'; // qlearn | sarsa
spec.gamma = 0.9; // discount factor, [0, 1)
spec.epsilon = 0.8; // initial epsilon for epsilon-greedy policy, [0, 1)
spec.alpha = 0.005; // value function learning rate
spec.experience_add_every = 5; // number of time steps before we add another experience to replay memory
spec.experience_size = 10000; // size of experience
spec.learning_steps_per_iteration = 5;
spec.tderror_clamp = 1.0; // for robustness
spec.num_hidden_units = 100 // number of neurons in hidden layer

agent = new RL.DQNAgent(env, spec); 

function xor(a , b) {
    return (a && !b) || (!a && b);
}

function genRand(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

setInterval(function(){ // start the learning loop
    var a = genRand(0, 1);
    var b = genRand(0, 1);
    //console.log("inputs", a, b);

    var action = agent.act([a, b]); // s is an array of length 8
    var reward = 0;
    
    if (action == xor(a, b)) {
        reward = 1;
    } else {
        reward = -3;
    }
    
    console.log("results", action, reward);
    //... execute action in environment and get the reward
    agent.learn(reward); // the agent improves its Q,policy,model, etc. reward is a float
}, 0);