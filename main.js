//Aliases
var Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    Text = PIXI.Text,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    Graphics = PIXI.Graphics;

//Creates window in browser 720 by 720
var renderer = autoDetectRenderer(720, 760, {resolution: 1});
var stage = new Container();
document.body.appendChild(renderer.view);

//These are all the lines that will be drawn on the stage, the format of the arrays are [x1, y1, x2, y2]
var lpoints = stagedata;

//This is a global array that stores all the lines
var lines = [];

var label;

loader
	.add("img/p.png")
	.load(init);

//Adds all the lines, and the collision label
function stageSet() {
	var msg = new PIXI.Text('Smooth Sailing',{fontFamily : 'Arial', fontSize: 14, fill : 0xFFFFFF, align : 'center'});
	stage.addChild(msg);
	label = stage.children[0];
	label.y = 740;

	var top = new Graphics(),
		bottom = new Graphics(),
		rside = new Graphics(),
		lside = new Graphics();

	top.lineStyle(2, 0x00FF00, 1);
	bottom.lineStyle(2, 0x00FF00, 1);
	rside.lineStyle(4, 0x00FF00, 1);
	lside.lineStyle(4, 0x00FF00, 1);

	top.moveTo(0, 0);
	bottom.moveTo(0, 720);
	rside.moveTo(720, 0);
	lside.moveTo(0, 0);

	top.lineTo(720, 0);
	bottom.lineTo(720, 720);
	rside.lineTo(720, 720);
	lside.lineTo(0, 720);

	lines.push(top);
	lines.push(bottom);
	lines.push(rside);
	lines.push(lside);

	var i;
	for(i = 0; i < lpoints.length; i++){
		var ln = new Graphics();
		ln.lineStyle(4, 0xFFFFFF, 1);
		ln.moveTo(lpoints[i][0], lpoints[i][1]);
		ln.lineTo(lpoints[i][2], lpoints[i][3]);
		lines.push(ln);
	}

	stagedata.push([0,0, 720, 0]);
	stagedata.push([0,0, 0, 720]);
	stagedata.push([720, 0, 720, 720]);
	stagedata.push([0, 720, 720, 720]);

	for(i = 0; i < lines.length; i++){
		stage.addChild(lines[i]);
	}	
}

function init(){
	stageSet();
	particleLoad();
	workerInit();
	bindKeys();
	renderLoop();
}

//Particle Init
var particle;

//Initializes all the variables for the particle
function particleLoad(){
	particle = new Sprite(resources["img/p.png"].texture);
	//Circle Diameter
	particle.height = 50;
	particle.width = 50;
	//Starting position
	particle.x = 300;
	particle.y = 300;
	//Reference point for center
	particle.anchor.x = .5;
	particle.anchor.y = .5;
	//Important Driving Variables
	particle.speed = 0;
	particle.rotation = 0;
	//Particle States
	particle.accel = 0;
	particle.steer = 0;
	stage.addChild(particle);
}

//Game Play

//Worker Thread
var driver;
function workerInit(){
	driver = new Worker("driver.js");
	driver.onmessage = function(pstate) {
		console.log(pstate);
		particle.accel = pstate.data.accel;
		particle.steer = pstate.data.steer;
	};
}

function driverState(){
	driver.postMessage({});
}


//Keyboard functionality (I just copied this method from somewhere)
function keyboard(keyCode) {
  var key = {};
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  //The `downHandler`
  key.downHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
    }
    event.preventDefault();
  };

  //The `upHandler`
  key.upHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
    }
    event.preventDefault();
  };

  //Attach event listeners
  window.addEventListener(
    "keydown", key.downHandler.bind(key), false
  );
  window.addEventListener(
    "keyup", key.upHandler.bind(key), false
  );
  return key;
}

//This is used to bind controlls to t
var up, down, right, left;
function bindKeys(){
	up = keyboard(38);
	down = keyboard(40);
	right = keyboard(39);
	left = keyboard(37);
}
function keyState(){
	if(up.isDown){
		particle.accel = 1;
	}
	if(down.isDown){
		particle.accel = -1;
	}
	if(!down.isDown && !up.isDown){
		particle.accel = 0;
	}
	if(right.isDown){
		particle.steer = 1;
	}
	if(left.isDown){
		particle.steer = -1;
	}
	if(!right.isDown && !left.isDown){
		particle.steer = 0;
	}
}

// This is the bare bones of the animation loop, it is run 60 times per second and updates the particle, stage, and checks for collisions
function renderLoop(){
	requestAnimationFrame(renderLoop);
	//keyState();
	driverState();
	particleState();
	if(colCheck()){
		label.text = "OUCH!";
	}else {
		label.text = "Smooth Sailing!";
	}
	renderer.render(stage);
}

//This function handles the position and behaviour of the particle
function particleState(){
	if(particle.steer > 0){
		steer(.1);
	}
	if(particle.steer < 0){
		steer(-.1);
	}
	if(particle.accel > 0 && particle.speed < 4){
		accelerate(.4);
	}
	if(particle.accel < 0 && particle.speed - .5 >= 0){
		accelerate(-.5);
	}else if(particle.accel < 0 && particle.speed - .5 < 0){
		particle.speed = 0;
	}

	//Current speed is added to the position of the particle, think velocity equation...
	particle.x += particle.speed*Math.cos(Math.PI/2 - particle.rotation);
  	particle.y -= particle.speed*Math.sin(Math.PI/2 - particle.rotation);
}

//Particle Functions
function steer(rad){
	particle.rotation += rad;
}
function accelerate(v){
	particle.speed += v;
}
//Collision check for all lines stored in the lines array

function colCheck(){
	var i;
	for(i = 0; i < lpoints.length; i++){
		if(lpoints[i][0] - lpoints[i][2] == 0){
			if(pintersectionX(particle, lpoints[i])){
				return 1;
			}
		}else if(lpoints[i][1] - lpoints[i][3] == 0){
			if(pintersectionY(particle, lpoints[i])){
				return 1;
			}
		}else{
			if(pintersectionF(particle, lpoints[i])){
				return 1;
			}
		}
	}
	return 0;
}

//Function for detecting intersection if the line is vertical
function pintersectionX(part, line){
	if(boverlap(part.x - part.width/2, part.x + part.width/2,line[0], line[0]) && boverlap(line[1], line[3], part.y - part.width/2, part.y + part.width/2)){
		return true;
	}
	return false;
}

function pintersectionY(part, line){
	if(boverlap(part.y - part.width/2, part.y + part.width/2,line[1], line[1]) && boverlap(line[0], line[2], part.x - part.width/2, part.x + part.width/2)){
		return true;
	}
	return false;
}

//Function for detecting if there is an intersection between a given line and the particle
function pintersectionF(part, line){
	if(!boverlap(line[0],line[2],part.x - part.width/2, part.x + part.width/2) || !boverlap(line[1],line[3],part.y - part.width/2, part.y + part.width/2)){
		return false;
	}
	var a = part.x;
	var c = part.y;
	var r = part.width/2;
	var m = (line[2] - line[0])/(line[3] - line[1]);
	var b = line[1] - m*line[0];
	if(Math.pow(r,2)*Math.pow(m,2) + 2*c*a*m - Math.pow(c,2)*Math.pow(m,2) - 2*b*c*m + Math.pow(r,2) +2*b*a - Math.pow(b,2) - Math.pow(a,2) >= 0){
		return true;
	}else{
		return false;
	}
}

function boverlap(a1, a2, a3, a4){
	if((a3 <= Math.max(a1,a2) && a3 >= Math.min(a1,a2)) || (a4 <= Math.max(a1,a2) && a4 >= Math.min(a1,a2))){
		return true;
	}
	return false;
}