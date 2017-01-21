PIXI.loader
	.add("img/p.png")

function Particle(x, y, dest){
	var sprite = new PIXI.Sprite(resources["img/p.png"].texture);
	//Circle Diameter
	sprite.height = 50;
	sprite.width = 50;
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
	//Particle States
	sprite.accel = 0;
	sprite.steer = 0;
	//Routing
	sprite.route = pg.shortestPath([x, y], dest);

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
	sprite.driver.onmessage = function(pstate) {
		if(pstate.data.brake){
			sprite.stop();
		}
		sprite.accel = pstate.data.accel;
		sprite.steer = pstate.data.steer;
	};

	sprite.driver.postMessage({header:"stage", stage: lpoints});
	return sprite;
}

function driverState(){
	var obj = this;
	this.driver.postMessage({
		header:"partdata",
		x: this.x,
		y: this.y,
		rad: this.rotation,
		speed: this.speed,
		gps: gps(obj)
	});
}

function state(){
	this.turn(this.steer);
	this.accelerate(this.accel);
	this.animate();
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
	this.steer = 0;
	this.accel = 0;
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
	if((a3 <= Math.max(a1,a2) && a3 >= Math.min(a1,a2)) || (a4 <= Math.max(a1,a2) && a4 >= Math.min(a1,a2))){
		return true;
	}
	return false;
}