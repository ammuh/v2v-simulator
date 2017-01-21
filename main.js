//Aliases
var Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    Text = PIXI.Text,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    Graphics = PIXI.Graphics;

//Creates window in browser 720 by 720
var renderer = autoDetectRenderer(720, 745, {resolution: 1});
var stage = new Container();
document.body.appendChild(renderer.view);

//These are all the lines that will be drawn on the stage, the format of the arrays are [x1, y1, x2, y2]
var lpoints = stageData;

// These are the graph nodes
var gNodes = graphEdges;

//This is a global array that stores all the lines
var lines = [];

var label;

loader
	.load(init);

//Adds all the lines, and the collision label
function stageSet() {
	var msg = new PIXI.Text('Smooth Sailing',{fontFamily : 'Arial', fontSize: 14, fill : 0xFFFFFF, align : 'center'});
	stage.addChild(msg);
	label = stage.children[0];
	label.y = 725;

	var i;
	for(i = 0; i < lpoints.length; i++){
		var ln = new Graphics();
		ln.lineStyle(4, 0xFFFFFF, 1);
		ln.moveTo(lpoints[i][0], lpoints[i][1]);
		ln.lineTo(lpoints[i][2], lpoints[i][3]);
		lines.push(ln);
	}

  for (var i = 0; i < gNodes.length; i++) {
    var gfx = new Graphics();
		ln.lineStyle(1, 0x2ecc71, 1);
		ln.moveTo(gNodes[i][0][0], gNodes[i][0][1]);
		ln.lineTo(gNodes[i][1][0], gNodes[i][1][1]);
    stage.addChild(ln)
  }

	for(i = 0; i < lines.length; i++){
		stage.addChild(lines[i]);
	}
}

function init(){
	stageSet();
	particle = Particle(300, 300);
	stage.addChild(particle);
	renderLoop();
}

//Message Board
var fps = 0;
function messageUpdate(){
	var str = "";// = "  FPS: "+ fps;
	str += "accel: " + particle.accel;
	str += ", steer: " + particle.steer;
	str += ", speed: " + (Math.round(particle.speed) + Math.round(100*(particle.speed - Math.floor(particle.speed)))/100);
	str += ", rotation (Approx): " + Math.floor(particle.rotation/(Math.PI/6));
	str += " \u00B7	\u03C0/6, collision: " + particle.collisionCheck(stageData);
	if(gps(particle)){
		str += ", distanceToPoint: " + Math.floor(gps(particle).dist);
		str += ", rad: " + gps(particle).rot;
	}
	label.setText(str);
}
//Particle Init
var particle;

//Game Play

// This is the bare bones of the animation loop, it is run 60 times per second and updates the particle, stage, and checks for collisions
var then = new Date;
function renderLoop(){
	var now = new Date;
	requestAnimationFrame(renderLoop);
	particle.driverState();
	particle.state();
	fps = 8*Math.floor((1000 / (now - then))/8);
	then = now;
	messageUpdate();
	renderer.render(stage);
}

//This function handles the position and behaviour of the particle



function gps(part){
	var i = 0;
	while(part.route[i].traveled == 1){
		i++;
		if(i >= part.route.length){
			return null;
		}
	}
	var point = part.route[i].point;

	var hyp = Math.sqrt(Math.pow(part.x - point[0], 2) + Math.pow(part.y - point[1], 2));
	if(hyp < 30){
		part.route[i].traveled = 1;
		return null;
	}
	var adj = point[0] - part.x;
	var rad = Math.acos(adj/hyp);
	if(point[1] > part.y){
		return {dist : hyp, rot: Math.PI/2+rad - part.rotation}
	}else{
		return {dist : hyp, rot: Math.PI/2-rad - part.rotation};
	}
}
