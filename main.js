//Aliases

var Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite;
    Graphics = PIXI.Graphics;

var renderer = autoDetectRenderer(720, 720, {resolution: 1});
var stage = new Container();
document.body.appendChild(renderer.view);

loader
	.add("img/p.png")
	.load(init);


function init(){
	stageSet();
	particleLoad();
	bindKeys();
	renderLoop();
}

//Road boundaries
var lpoints = [
	[ 310, 0, 310, 720],
	[ 410, 0, 410, 720]
];

var lines = [];

function stageSet() {
	var i;
	for(i = 0; i < lpoints.length; i++){
		var ln = new Graphics();
		ln.lineStyle(20, 0xFFFFFF, 1);
		ln.moveTo(lpoints[i][0], lpoints[i][1]);
		ln.lineTo(lpoints[i][2], lpoints[i][3]);
		lines.push(ln);
	}
	for(i = 0; i < lines.length; i++){
		stage.addChild(lines[i]);
	}	
	
}

//Particle Init
var particle;

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

//Keyboard functionality
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

var up, down, right, left;
function bindKeys(){
	up = keyboard(38);
	down = keyboard(40);
	right = keyboard(39);
	left = keyboard(37);
}

function renderLoop(){
	requestAnimationFrame(renderLoop);
	particleState();
	renderer.render(stage);
}

function particleState(){
	if(right.isDown){
		particle.rotation += 0.1;
	}
	if(left.isDown){
		particle.rotation -= 0.1;
	}
}