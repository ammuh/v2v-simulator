//Aliases
var Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    Text = PIXI.Text,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    Graphics = PIXI.Graphics;

//Creates window in browser 720 by 720
var renderer = autoDetectRenderer(720, 720, {resolution: 1});
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

	var i;
	for(i = 0; i < lpoints.length; i++){
		var ln = new Graphics();
		ln.lineStyle(4, 0xFFFFFF, 1);
		ln.moveTo(lpoints[i][0], lpoints[i][1]);
		ln.lineTo(lpoints[i][2], lpoints[i][3]);
		lines.push(ln);
	}
	for(i = 0; i < lines.length; i++){
		stage.addChild(lines[i]);
	}	
}

function init(){
	stageSet();
	particleLoad();
	bindKeys();
	renderLoop();
}

//Particle Init
var particle;

//Initializes all the variables for the particle
function particleLoad(){
	particle = new Sprite(resources["img/p.png"].texture);
	particle.height = 50;
	particle.width = 50;
	particle.x = 360;
	particle.y = 720;
	particle.anchor.x = .5;
	particle.anchor.y = .5;
	particle.speed = 0;
	particle.rotation = 0;
	stage.addChild(particle);
}

//Game Play

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

// This is the bare bones of the animation loop, it is run 60 times per second and updates the particle, stage, and checks for collisions
function renderLoop(){
	requestAnimationFrame(renderLoop);
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
	if(right.isDown){
		particle.rotation += 0.1;
	}
	if(left.isDown){
		particle.rotation -= 0.1;
	}
	if(up.isDown && particle.speed < 4){
		particle.speed += .4;
	}
	if(down.isDown && particle.speed - .5 >= 0){
		particle.speed -= .5;
	}else if(down.isDown && particle.speed - .5 < 0){
		particle.speed = 0;
	}

	//Current speed is added to the position of the particle, think velocity equation...
	particle.x += particle.speed*Math.cos(Math.PI/2 - particle.rotation);
  	particle.y -= particle.speed*Math.sin(Math.PI/2 - particle.rotation);
}

//Collision check for all lines stored in the lines array

function colCheck(){
	var i;
	for(i = 0; i < lpoints.length; i++){
		if(lpoints[i][0] - lpoints[i][2] == 0){
			if(pintersectionX(particle, lpoints[i])){
				return 1;
			}
		}else{
			if(pintersectionY(particle, lpoints[i])){
				return 1;
			}
		}
	}
	return 0;
}

//Function for detecting intersection if the line is vertical
function pintersectionX(part, line){
	if(line[0] < part.x + part.width/2 && line[0] > part.x - part.width/2 && boverlap(line[1], line[3], part.y - part.width/2, part.y + part.width/2)){
		return true;
	}
	return false;
}

//Function for detecting if there is an intersection between a given line and the particle
function pintersectionY(part, line){
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