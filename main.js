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
	renderer.render(stage);
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