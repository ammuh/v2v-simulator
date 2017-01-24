var Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    Text = PIXI.Text,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    Graphics = PIXI.Graphics;

//Creates window in browser 720 by 720
var renderer = autoDetectRenderer(720, 720, 
	{resolution: 1});
var stage = new Container();
document.body.appendChild(renderer.view);
stage.interactive = true;

var graphics = new Graphics();

graphics.beginFill(0x000000);

// set the line style to have a width of 5 and set the color to red
graphics.lineStyle(1, 0xFF0000);

// draw a rectangle
graphics.drawRect(0, 0, 720, 720);

stage.addChild(graphics);



stage
    .on('mousedown', onButtonDown)
    .on('mouseup', onButtonUp)
    .on('mouseupoutside', onButtonUp)
    .on('touchstart', onButtonDown)
    .on('touchend', onButtonUp)
    .on('touchendoutside', onButtonUp);

renderer.render(stage);

function onButtonDown(){
	console.log("onButtonDown");
}

function onButtonUp(){
	console.log("onButtonUp");
}