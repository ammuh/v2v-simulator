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
var lpoints = stageData;

// These are the graph nodes
var gNodes = graphEdges;

//This is a global array that stores all the lines
var lines = [];

var label;

var pg;

//Particle Array
var particle;

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

	pg = new PathGraph();
	for(i = 0; i < gNodes.length; i++){
		var gfx = new Graphics();
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

function init(){
	stageSet();
	particle = [];
	particle.push(Particle(200, 200, gNodes[0][0]));
	particle.push(Particle(600, 600, gNodes[1][1]));
	$( "ul" ).append( "<li></li>" );
	$( "ul" ).append( "<li></li>" );
	var i;
	for(i = 0; i < particle.length; i++){
		stage.addChild(particle[i]);
	}
	renderLoop();
}

//Message Board
var fps = 0;
function messageUpdate(lbl, part){
	var str = "";// = "  FPS: "+ fps;
	str += "accel: " + part.accel;
	str += ", steer: " + part.steer;
	str += ", speed: " + (Math.round(part.speed) + Math.round(100*(part.speed - Math.floor(part.speed)))/100);
	str += ", rotation (Approx): " + Math.floor(part.rotation/(Math.PI/6));
	str += " \u00B7	\u03C0/6, collision: " + part.collisionCheck(stageData);
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
		particle[i].state();
	}
	fps = 8*Math.floor((1000 / (now - then))/8);
	then = now;
	i = 0;
	$("ul li").each(function() {
		messageUpdate(this, particle[i]);
		i++;
	});
	if(particleCollision(particle[0], particle[1])){
		label.text = "OUCH";
	}else{
		label.text = "We Good";
	}
	if(boundaryCollision()){
		label.text = "Watch the sides fam";
	}
	
	renderer.render(stage);
}

//Global Physics

function boundaryCollision(){
	for(var i = 0; i < particle.length; i++){
		if(particle[i].collisionCheck(lpoints)){
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
	if(hyp < 30){
		part.route[i].traveled = 1;
		return null;
	}
	var adj = point[0] - part.x;
	var rad = Math.acos(adj/hyp);
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

function radar(){

}

function dof(part, zone){
	var min_clearance = 2*Math.asin(part.width/(2*zone+part.width/2));
	var sections = Math.ceil(2*Math.PI/min_clearance);
	var fibers = 32;
	var fibrad = [];
	var fibpoints = [];
	for(var i = 0; i < fibers; i++){
		fibpoints.push([part.x, part.y, Math.floor(part.x+(zone+part.width)*Math.sin(i*(2*Math.PI/fibers))), Math.floor(part.y - (zone+part.width)*Math.cos(i*(2*Math.PI/fibers)))]);
		fibrad.push(i*(2*Math.PI/fibers));
	}
	var objects = objectsInZone(part, zone);
	for(var i = 0; i < objects.length; i++){
		if(objects[i].type == "particle"){
			for(var a = 0; a < fibpoints.length; a++){
				if(fibpoints[a] != null){
					if(objects[i].particle.collisionCheck(fibpoints[a])){
						fibpoints[a] = null;
						fibrad[a] = null;
					}
				}
			}
		}else if(objects[i].type == "line"){
			for(var a = 0; a < fibpoints.length; a++){
				var ps = objects[i].data;
				if(fibpoints[a] != null){
					if(lineIntersect(fibpoints[a][0], fibpoints[a][1] ,fibpoints[a][2] ,fibpoints[a][3], ps[0], ps[1], ps[2] ,ps[3])){
						fibpoints[a] = null;
						fibrad[a] = null;
					}
				}
			}
		}
	}
	return fibrad;
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
	part1.width += erad;
	part1.height += erad;
	var stat = part1.collisionCheck([line]);
	var stat2 = bengulf(part1.x- part1.width, part1.width + part1.x, line[0], line[2]) && bengulf(part1.y - part1.width, part1.width + part1.y, line[1], line[3]);
	part1.width -= erad;
	part1.height -= erad;
	return stat || stat2;
}

function lineIntersect(x1,y1,x2,y2, x3,y3,x4,y4) {
	if(y2 ==0 && y1 == 0 &&y3 == 0 && y4 ==0){
		return boverlap(y1, y2, y3, y4);
	}else if(x2 ==0 && x1 == 0 && x3 == 0 && x4 ==0){
		return boverlap(x1, x2, x3, x4);
	}else if(x2 ==0 && x1 == 0){
		return boverlap((y4-y3)/(x4-x3)*(x1-x3)+y3, (y4-y3)/(x4-x3)*(x1-x3)+y3, y3, y4);
	}else if(x3 ==0 && x4 == 0){
		return boverlap((y2-y1)/(x2-x1)*(x3-x1)+y1, (y2-y1)/(x2-x1)*(x3-x1)+y1, y1, y2);
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