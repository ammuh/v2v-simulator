PIXI.loader
	.add("img/p.png")

var SPEEDLIMIT = 4;
var smemory = 2;
var nfibers = 32;
var fibzone = 30;
var fang = 2*Math.PI/nfibers;
class Particle extends PIXI.Sprite{
	constructor(x, y, dest) {
		super(resources["img/p.png"].texture);
		this.height = 20;
		this.width = 20;
		//Starting position
		this.x = x;
		this.y = y;
		this.prevx;
		this.xstack = [];
		this.ystack = [];
		this.prevy;
		//Reference point for center
		this.anchor.x = .5;
		this.anchor.y = .5;
		//Important Driving Variables
		this.speed = 0;
		this.rotation = 0;
		this.fiber = 0;
		this.fibs = [];
		this.fibstats = [];
		this.fiberang = fang;
		for(var i = 0; i < nfibers; i++){
			this.fibs.push([this.x + ((this.width/2)+fibzone)*Math.cos(i*this.fiberang), this.y - ((this.width/2)+fibzone)*Math.sin(i*this.fiberang)]);
			this.fibstats.push({
				clear: true,
				distance: -1,
				fib: -1,
				speed: -1
			});
		}
		//Particle States
		this.accel = 0;
		this.steer = 0;
		//Routing
		this.route = [];
		var rt = pg.shortestPath([x, y], dest);
		for(var i = 0; i < rt.length; i++){
			this.route.push({
				traveled: 0,
				point: rt[i]
			});
		}
		this.boundcollision = false;
		this.prevNodeDist = 1/0;
		
		this.driver = new Worker("driver.js");
		this.driver.particle = this;
		this.driver.onmessage = function(pstate) {
			this.particle.speedSet(pstate.data.speed);
			this.particle.turnFib(pstate.data.fiber);
		};
	}

	driverState(){
		var obj = this;
		var d = 0;
		var f = 0;
		if(gps(this)){
			d = gps(this).dist;
			f = gps(this).rot;
		}
		this.driver.postMessage({
			train: null,
			fibers:radar(this),
			partFiber:this.fiber,
			speed: this.speed,
			distToNode: d,
			nodeFiber: closestFiber(this, f),
			rewards:{
				dist: isCloser(this),
				collision: collisionRule()
			}
		});
	}

	resultState(){
		var i = 0;
		while(this.route[i].traveled == 1){
			i++;
			if(i >= this.route.length){
				i = -1;
				break;
			}
		}
		var dest;
		if(i < 0){
			dest = null;
		}else{

			dest = [this.route[i][0], this.route[i][0]];
		}
		this.driver.postMessage({
			train: {
				position: {
					oldPosition: [this.prevx, this.prevy],
					newPosition: [this.prevx, this.prevy],
					destination: dest
				},
				hadCollision: this.boundcollision
			}
		});
	}

	animate(){
		if(this.xstack.length <= smemory && this.ystack.length <= smemory){
			this.xstack.push(this.x);
			this.ystack.push(this.y);
		}
		var tempx = this.x;
		var tempy = this.y;
		this.x += this.speed*Math.cos(Math.PI/2 - this.rotation);
	  	this.y -= this.speed*Math.sin(Math.PI/2 - this.rotation);
	  	var status = false;
	  	for(var i = 0; i < particle.length; i++){
			if(particle[i] != this){
				if(particleCollision(this, particle[i])){
					status = true;
				}
			}
		}
	  	if(status || this.collisionCheck(lpoints)){
	  		this.boundcollision = true;
	  		this.x = tempx;
	  		this.y = tempy;
	  	}else{
	  		this.boundcollision = false;
	  	}
	}

	
	backtrack(){
		var xpop = this.xstack.pop();
		var ypop = this.xstack.pop();
		if(xpop != undefined && ypop != undefined){
			this.x =xpop;
			this.y = ypop;
			return true;
		}
		return false;
	}

	//Particle Functions
	turn(rad){
		this.rotation += rad;
		this.rotation %= 2*Math.PI;
	}
	accelerate(v){
		this.speed += v;
	}
	stop(){
		this.speed = 0;
	}
	turnFib(f){
		this.fiber = f;
		this.rotation = f*fiberang;
		this.rotation %= 2*Math.PI;
	}
	
	speedSet(s){
		if(s > SPEEDLIMIT){
			this.speed = SPEEDLIMIT;
		}else if(s < 0){
			this.speed = 0;
		}else{
			this.speed = s;
		}
	}

	collisionCheck(lines){
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
	pintX(line){
		if(boverlap(this.x - this.width/2, this.x + this.width/2,line[0], line[0]) && boverlap(line[1], line[3], this.y - this.width/2, this.y + this.width/2)){
			return true;
		}
		return false;
	}

	pintY(line){
		if(boverlap(this.y - this.width/2, this.y + this.width/2,line[1], line[1]) && boverlap(line[0], line[2], this.x - this.width/2, this.x + this.width/2)){
			return true;
		}
		return false;
	}

	//Function for detecting if there is an intersection between a given line and the particle
	pintF(line){
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



