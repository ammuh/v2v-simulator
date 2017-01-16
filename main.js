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

//Road boundaries
var lpoints = [
	[ 310, 75, 310, 720-75],
	[ 410, 75, 410, 720-75],
];

var lines = [];

function setup() {
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
	renderer.render(stage);
}


setup();