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
graphics.lineStyle(0, 0xFF0000);

var width = 720;
var height = 720;
// draw a rectangle
graphics.drawRect(0, 0, width, height);

stage.addChild(graphics);

var gridInc = 10;
var gridColor = 0x696969;
function buildGrid(){
    for(var i = 0; i <= width; i+= gridInc){
        var graphic = new Graphics();
        graphic.lineStyle(1, gridColor, 1);
        graphic.moveTo(i,0);
        graphic.lineTo(i, height);
        stage.addChild(graphic);
    }
    for(var i = 0; i <= height; i+= gridInc){
        var graphic = new Graphics();
        graphic.lineStyle(1, gridColor, 1);
        graphic.moveTo(0,i);
        graphic.lineTo(width, i);
        stage.addChild(graphic);
    }
    renderer.render(stage);
}

stage
    .on('mousedown', onButtonDown)
    .on('mouseup', onButtonUp)
    .on('mouseupoutside', onButtonUp)
    .on('touchstart', onButtonDown)
    .on('touchend', onButtonUp)
    .on('touchendoutside', onButtonUp);

renderer.render(stage);
buildGrid();
var init;
var final;
function onButtonDown(e){
    console.log(e);

    init = [gridInc*Math.round(e.data.originalEvent.x/gridInc), gridInc*Math.round(e.data.originalEvent.y/gridInc)];
    console.log(e.data.originalEvent.x + ", "+e.data.originalEvent.y);
}

function onButtonUp(e){
    console.log(e);
	console.log(e.data.originalEvent.x + ", "+ e.data.originalEvent.y);
    var graphic = new Graphics();
 
    // begin a green fill..
    graphic.lineStyle(1, 0xFFFFFF, 1);
    // draw a triangle using lines
    graphic.moveTo(init[0],init[1]);
    graphic.lineTo(gridInc*Math.round(e.data.originalEvent.x/gridInc), gridInc*Math.round(e.data.originalEvent.y/gridInc));
     
    // end the fill
     
    // add it the stage so we see it on our screens..
    stage.addChild(graphic);
    renderer.render(stage);
}