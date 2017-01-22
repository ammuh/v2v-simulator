PIXI.loader
	.add("img/p.png")

function Particle(x, y, dest){
	var sprite = new PIXI.Sprite(resources["img/p.png"].texture);
	//Circle Diameter
	sprite.height = 25;
	sprite.width = 25;
	//Starting position
	sprite.x = x;
	sprite.y = y;
	sprite.prevx;
	sprite.prevy;
	//Reference point for center
	sprite.anchor.x = .5;
	sprite.anchor.y = .5;
	//Important Driving Variables
	sprite.speed = 0;
	sprite.rotation = 0;
	sprite.fiber = 0;
	//Particle States
	sprite.accel = 0;
	sprite.steer = 0;
	//Routing
	sprite.route = [];
	var rt = pg.shortestPath([x, y], dest);
	for(var i = 0; i < rt.length; i++){
		sprite.route.push({
			traveled: 0,
			point: rt[i]
		});
	}
	sprite.prevNodeDist = 1/0;
	sprite.collisionCheck = collisionCheck;
	sprite.pintX = pintX;
	sprite.pintY = pintY;
	sprite.pintF = pintF;
	sprite.state = state;
	sprite.animate = animate;
	sprite.driverState = driverState;
	sprite.driver = new Worker("driver.js");
	sprite.turn = turn;
	sprite.accelerate = accelerate;
	sprite.stop = stop;
	sprite.backtrack = backtrack;
	sprite.turnFib = turnFib;
	sprite.speedSet = speedSet;
	sprite.driver.onmessage = function(pstate) {
		sprite.speedSet(pstate.data.speed);
		sprite.turnFib(pstate.data.fiber);
	};
	return sprite;
}

function driverState(){
	var obj = this;
	this.driver.postMessage({
		fibers:radar(this),
		partFiber:this.fiber,
		speed: this.speed,
		distToNode: gps(this).dist,
		nodeFiber: closestFiber(this, gps(this).rot),
		rewards:{
			dist: isCloser(this),
			collision: collisionRule()
		}
	});
}

function state(){
}

function animate(){
	this.prevx = this.x;
	this.prevy = this.y;
	this.x += this.speed*Math.cos(Math.PI/2 - this.rotation);
  	this.y -= this.speed*Math.sin(Math.PI/2 - this.rotation);
}

function backtrack(){
	this.x = this.prevx;
	this.y = this.prevy;
}

//Particle Functions
function turn(rad){
	this.rotation += rad;
	this.rotation %= 2*Math.PI;
}
function accelerate(v){
	this.speed += v;
}
function stop(){
	this.speed = 0;
}
function turnFib(f){
	this.fiber = f;
	this.rotation = f*fiberang;
	this.rotation %= 2*Math.PI;
}
var SPEEDLIMIT = 4;
function speedSet(s){
	if(s > SPEEDLIMIT){
		this.speed = SPEEDLIMIT;
	}else if(s < 0){
		this.speed = 0;
	}else{
		this.speed = s;
	}
}

function collisionCheck(lines){
	var i;
	for(i = 0; i < lines.length; i++){
		if(lines[i][0] - lines[i][2] == 0){
			if(this.pintX(lines[i])){
				return 1;
			}
		}else if(lines[i][1] - lines[i][3] == 0){
			if(this.pintY(lines[i])){
				return 1;
			}
		}else{
			if(this.pintF(lines[i])){
				return 1;
			}
		}
	}
	return 0;
}

//Function for detecting intersection if the line is vertical
function pintX(line){
	if(boverlap(this.x - this.width/2, this.x + this.width/2,line[0], line[0]) && boverlap(line[1], line[3], this.y - this.width/2, this.y + this.width/2)){
		return true;
	}
	return false;
}

function pintY(line){
	if(boverlap(this.y - this.width/2, this.y + this.width/2,line[1], line[1]) && boverlap(line[0], line[2], this.x - this.width/2, this.x + this.width/2)){
		return true;
	}
	return false;
}

//Function for detecting if there is an intersection between a given line and the particle
function pintF(line){
	if(!boverlap(line[0],line[2],this.x - this.width/2, this.x + this.width/2) || !boverlap(line[1],line[3],this.y - this.width/2, this.y + this.width/2)){
		return false;
	}
	var a = this.x;
	var c = this.y;
	var r = this.width/2;
	var m = (line[2] - line[0])/(line[3] - line[1]);
	var b = line[1] - m*line[0];
	if(Math.pow(r,2)*Math.pow(m,2) + 2*c*a*m - Math.pow(c,2)*Math.pow(m,2) - 2*b*c*m + Math.pow(r,2) +2*b*a - Math.pow(b,2) - Math.pow(a,2) >= 0){
		return true;
	}else{
		return false;
	}
}

function boverlap(a1, a2, a3, a4){
	if((a3 <= Math.max(a1,a2) && a3 >= Math.min(a1,a2)) || (a4 <= Math.max(a1,a2) && a4 >= Math.min(a1,a2)) || (a1 <= Math.max(a3,a4) && a1 >= Math.min(a3,a4))|| (a2 <= Math.max(a3,a4) && a2 >= Math.min(a3,a4))){
		return true;
	}
	return false;
}

function bengulf(sup1, sup2, b1, b2){
	if(Math.max(sup1, sup2) >= Math.max(b1, b2) && Math.min(sup1, sup2) <= Math.min(b1, b2)){
		return true;
	}
	return false;
}