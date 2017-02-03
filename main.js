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
var uiList = $("body").append("<ul></u>");
//These are all the lines that will be drawn on the stage, the format of the arrays are [x1, y1, x2, y2]


var lpoints;

// These are the graph nodes
var gNodes;

//This is a global array that stores all the lines
var lines = [];

var label;

var pg;

//Particle Array
var particle;

loader
	.load(loadStage);

function loadStage(){
	$.getJSON( "stages/stg1.json", function(data) {
		stageData = data.points;
		graphEdges = data.edges;
		console.log(data);
		init();
	});
}

function init(){
	for(var i = 0; i < stageData.length; i++){
		stageData[i] = stageData[i][0].concat(stageData[i][1]);
	}

	lpoints = stageData;
	gNodes = graphEdges;
	stageSet();
	particle = [];
	particle.push(new Particle(20, 20, [700,700]));
	particle.push(new Particle(20, 700, [450, 360]));
	particle.push(new Particle(700, 20, [30, 660]));
	particle.push(new Particle(360, 360, [450, 360]));
	particle.push(new Particle(450, 690, [700,700]));
	particle.push(new Particle(690, 360, [450, 360]));
	$( "ul" ).append( "<li></li>" );
	$( "ul" ).append( "<li></li>" );
	$( "ul" ).append( "<li></li>" );
	$( "ul" ).append( "<li></li>" );
	$( "ul" ).append( "<li></li>" );
	$( "ul" ).append( "<li></li>" );
	var i;
	for(i = 0; i < particle.length; i++){
		stage.addChild(particle[i]);
	}
	renderLoop();
}

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

	pg = new PathGraph();
	for(i = 0; i < gNodes.length; i++){
		var ln = new Graphics();
		ln.lineStyle(1, 0x2ecc71, 1);
		ln.moveTo(gNodes[i][0][0], gNodes[i][0][1]);
		ln.lineTo(gNodes[i][1][0], gNodes[i][1][1]);
		pg.addEdge(gNodes[i][0], gNodes[i][1], false);
		stage.addChild(ln);
	}

	for(i = 0; i < lines.length; i++){
		stage.addChild(lines[i]);
	}
}



//Message Board
var fps = 0;
function messageUpdate(lbl, part){
	var str = "";// = "  FPS: "+ fps;
	str += "accel: " + part.accel;
	str += ", steer: " + part.steer;
	str += ", speed: " + (Math.round(part.speed) + Math.round(100*(part.speed - Math.floor(part.speed)))/100);
	str += ", rotation (Approx): " + Math.floor(part.rotation/(Math.PI/6));
	str += " \u00B7	\u03C0/6, collision: " + part.boundcollision;
	if(gps(part)){
		str += ", distanceToPoint: " + Math.floor(gps(part).dist);
		str += ", rad: " + gps(part).rot;
	}
	$(lbl).text(str);
}


//Game Play

// This is the bare bones of the animation loop, it is run 60 times per second and updates the particle, stage, and checks for collisions
var then = new Date;
function renderLoop(){
	var now = new Date;
	requestAnimationFrame(renderLoop);
	var i;
	for(i = 0; i < particle.length; i++){
		particle[i].driverState();
		particle[i].animate();
		particle[i].resultState();
	}
	fps = 8*Math.floor((1000 / (now - then))/8);
	then = now;
	i = 0;
	$("ul li").each(function() {
		messageUpdate(this, particle[i]);
		i++;
	});
	if(collisionRule()){
		label.text = "OUCH";
	}else{
		label.text = "We Good";
	}
	renderer.render(stage);
}

//Global Physics

function collisionRule(){
	for(var i = 0; i < particle.length; i++){
		for(var j = i+1; j < particle.length; j++){
			if(particleCollision(particle[i], particle[j])){
				return true;
			}
		}
	}
	return false;
}

function pcollision(part){
	if(part.collisionCheck(lpoints)){
			return true;
	}
	for(var i = 0;  i< particle.length; i++){
		if(particle[i] != part && particleCollision(particle[i], part)){
			return true;
		}
	}
	return false;
}

//This function handles the position and behaviour of the particle

function gps(part){
	var i = 0;
	while(part.route[i].traveled == 1){
		i++;
		if(i >= part.route.length){
			part.stop();
			return null;
		}
	}
	var point = part.route[i].point;

	var hyp = Math.sqrt(Math.pow(part.x - point[0], 2) + Math.pow(part.y - point[1], 2));
	if(hyp < 20){
		part.route[i].traveled = 1;
		return null;
	}
	var adj = point[0] - part.x;
	var rad = Math.acos(adj/hyp);

	if(part.route.length == i){
		var dest = graphEdges[genRand(0,graphEdges-1)][genRand(0,1)];
		part.route = shortestPath(part.route[i-1], dest);
	}

	if(point[1] > part.y){
		var rota = (Math.PI/2)+rad - part.rotation;
		if(rota > Math.PI){
			return {dist : hyp, rot: rota - (2*Math.PI)}
		}else if(rota < -Math.PI){
			return {dist : hyp, rot: rota + (2*Math.PI)}
		}else{
			return {dist : hyp, rot: rota};
		}
	}else{
		var rota = (Math.PI/2)-rad - part.rotation;
		if(rota > Math.PI){
			return {dist : hyp, rot: rota - (2*Math.PI)}
		}else if(rota < -Math.PI){
			return {dist : hyp, rot: rota + (2*Math.PI)}
		}else{
			return {dist : hyp, rot: rota};
		}
	}
}

function genRand(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isCloser(part){
	if(gps(part) != null && gps(part).dist < part.prevNodeDist){
		return true;
	}
	return false;
}

function closestFiber(part, r){
	return Math.round((r + part.rotation)/fiberang);
}


function radar(part){
	var zoneSize = 30;
	return dof(part, zoneSize);
}

var fibers = 32;
var fiberang = 2*Math.PI/fibers;
function dof(part, zone){
	var fibrad = [];
	var fibpoints = [];
	var fibs = [];
	for(var i = 0; i < fibers; i++){
		fibpoints.push([part.x, part.y, part.x + ((part.width/2)+zone)*Math.cos(i*fiberang), part.y - ((part.width/2)+zone)*Math.sin(i*fiberang)]);
		fibrad.push(i);
		fibs.push({
			clear: true,
			distance: 0,
			fib: -1,
			speed: 0
		});
	}
	var objects = objectsInZone(part, zone);
	for(var i = 0; i < objects.length; i++){
		if(objects[i].type == "particle"){
			for(var a = 0; a < fibpoints.length; a++){
				if(2*[a] != null){
					if(objects[i].particle.collisionCheck(fibpoints[a])){
						fibs[a].clear = false;
						fib = part.fiber;
						speed = part.speed;
						fibs[a].distance = Math.sqrt(Math.pow(part.x - objects[i].particle.x) + Math.pow(part.y - objects[i].particle.y)) - part.width;
					}
				}
			}
		}else if(objects[i].type == "line"){
			for(var a = 0; a < fibpoints.length; a++){
				var ps = objects[i].data;
				if(fibpoints[a] != null){
					if(math.intersect([fibpoints[a][0], fibpoints[a][1]] ,[fibpoints[a][2] ,fibpoints[a][3]], [ps[0], ps[1]], [ps[2] ,ps[3]])){
						fibs[a].clear = false;
						var inter = math.intersect([fibpoints[a][0], fibpoints[a][1]], [fibpoints[a][2] ,fibpoints[a][3]], [ps[0], ps[1]], [ps[2] ,ps[3]]);
						fibs[a].distance = Math.sqrt(Math.pow(inter[0]-fibpoints[a][0],2) + Math.pow(inter[1]-fibpoints[a][1],2));
					}
				}
			}
		}
	}
	return fibs;
}

function objectsInZone(part, zone){
	var objs = [];
	for(var i = 0; i < particle.length; i++){
		if(particle[i] != part){
			if(pinZone(part, particle[i], zone)){
				objs.push({
					type: "particle",
					particle: particle[i]
				});
			}
		}
	}
	//DANGEROUS, but temporary circle resize
	for(var i = 0; i < lpoints.length; i++){
		if(linZone(part, lpoints[i], zone)){
			objs.push({
				type: "line",
				data: lpoints[i]
			});
		}
	}
	return objs;
}

function particleCollision(part1, part2){
	if(Math.pow(part1.x - part2.x, 2) + Math.pow(part1.y - part2.y, 2) <= Math.pow(part1.width,2)){
		return true;
	}
	return false;
}

function pinZone(part1, part2, erad){
	if(Math.pow(part1.x - part2.x, 2) + Math.pow(part1.y - part2.y, 2) <= Math.pow(part1.width+erad,2)){
		return true;
	}
	return false;
}

function linZone(part1, line, erad){
	part1.width += 2*erad;
	part1.height += 2*erad;
	var stat = part1.collisionCheck([line]);
	var stat2 = bengulf(part1.x- part1.width, part1.width + part1.x, line[0], line[2]) && bengulf(part1.y - part1.width, part1.width + part1.y, line[1], line[3]);
	part1.width -= 2*erad;
	part1.height -= 2*erad;
	return stat || stat2;
}

function lineIntersect(x1,y1,x2,y2, x3,y3,x4,y4) {
	x1 = Math.round(x1);
	x2 = Math.round(x2);
	x3 = Math.round(x3);
	x4 = Math.round(x4);
	y1 = Math.round(y1);
	y2 = Math.round(y2);
	y3 = Math.round(y3);
	y4 = Math.round(y4);

	if(y2 - y1 == 0 && y3 - y4 ==0 && y3 == y1){
		return boverlap(x1, x2, x3, x4);
	}else if(x2 - x1 == 0 && x3 - x4 ==0 && x1 == x3){
		return boverlap(y1, y2, y3, y4);
	}else if(x2 - x1 == 0){
		if(y3 - y4 != 0){
			return boverlap((y4-y3)/(x4-x3)*(x1-x3)+y3, (y4-y3)/(x4-x3)*(x1-x3)+y3, y3, y4);
		}else{
			return boverlap(x1, x1, x3, x4);
		}
	}else if(x3 - x4 == 0){
		if(y1 - y2 != 0){
			return boverlap((y2-y1)/(x2-x1)*(x3-x1)+y1, (y2-y1)/(x2-x1)*(x3-x1)+y1, y1, y2);
		}else{
			return boverlap(x3, x3, x1, x2);
		}
	}

    var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    if (isNaN(x)||isNaN(y)) {
        return false;
    } else {
        if (x1>=x2) {
            if (!(x2<=x&&x<=x1)) {return false;}
        } else {
            if (!(x1<=x&&x<=x2)) {return false;}
        }
        if (y1>=y2) {
            if (!(y2<=y&&y<=y1)) {return false;}
        } else {
            if (!(y1<=y&&y<=y2)) {return false;}
        }
        if (x3>=x4) {
            if (!(x4<=x&&x<=x3)) {return false;}
        } else {
            if (!(x3<=x&&x<=x4)) {return false;}
        }
        if (y3>=y4) {
            if (!(y4<=y&&y<=y3)) {return false;}
        } else {
            if (!(y3<=y&&y<=y4)) {return false;}
        }
    }
    return true;
}
