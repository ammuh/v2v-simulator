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

var gridInc = 20;
var gridColor = 0x696969;
var gridLines = [];
function buildGrid(){
    for(var i = 0; i <= width; i+= gridInc){
        var graphic = new Graphics();
        graphic.lineStyle(1, gridColor, 1);
        graphic.moveTo(i,0);
        graphic.lineTo(i, height);
        stage.addChild(graphic);
        gridLines.push(graphic);
    }
    for(var i = 0; i <= height; i+= gridInc){
        var graphic = new Graphics();
        graphic.lineStyle(1, gridColor, 1);
        graphic.moveTo(0,i);
        graphic.lineTo(width, i);
        stage.addChild(graphic);
        gridLines.push(graphic);
    }
    renderer.render(stage);
}
function destroyGrid(){
    for(var i = 0; i < gridLines.length; i++){
        gridLines[i].destroy();
    }
}

stage
    .on('mousedown', onButtonDown)
    .on('mouseup', onButtonUp)
    .on('mouseupoutside', onButtonUp)
    .on('touchstart', onButtonDown)
    .on('touchend', onButtonUp)
    .on('touchendoutside', onButtonUp)
    .on('mousemove', updateGuide);

document.onkeydown = keys;

renderer.render(stage);
buildGrid();

var init;
var guide;

var ptgfx = [];
var points = [];
function onButtonDown(e){
    
    init = [gridInc*(Math.round(e.data.originalEvent.x/gridInc)), gridInc*(Math.round(e.data.originalEvent.y/gridInc))];
    guide = new Graphics();
 
    // begin a green fill..
    guide.lineStyle(1, 0xFF0000, 1);
    // draw a triangle using lines
    guide.moveTo(init[0],init[1]);
    guide.lineTo(init[0],init[1]);
    // add it the stage so we see it on our screens..
    stage.addChild(guide);
    renderer.render(stage);
}

function onButtonUp(e){
    var graphic = new Graphics();
 
    // begin a green fill..
    graphic.lineStyle(1, 0xFFFFFF, 1);
    // draw a triangle using lines
    graphic.moveTo(init[0],init[1]);
    fin = [gridInc*(Math.round(e.data.originalEvent.x/gridInc)), gridInc*(Math.round(e.data.originalEvent.y/gridInc))];
    
    if(fin[0] != init[0] || fin[1] != init[1]){
        points.push([[init[0],init[1]],[fin[0], fin[1]]]);
        ptgfx.push(graphic);
        graphic.lineTo(fin[0], fin[1]);
        stage.addChild(graphic);
    }
    else{
        graphic.destroy();
    }
    guide.destroy();
    guide = undefined;
    renderer.render(stage);
}
function updateGuide(e){
    if(guide != undefined){
        guide.destroy();
        guide = new Graphics();
        guide.lineStyle(1, 0xFF0000, 1);
        // draw a triangle using lines
        guide.moveTo(init[0],init[1]);
        guide.lineTo(gridInc*(Math.round(e.data.originalEvent.x/gridInc)), gridInc*(Math.round(e.data.originalEvent.y/gridInc)));
        // add it the stage so we see it on our screens..
        stage.addChild(guide);
        renderer.render(stage);
    }
}

function keys(ev){
    var evtobj = window.event? event : ev
    if (evtobj.keyCode == 90 && evtobj.ctrlKey){
        undo();
    }
}

function undo(){
    points.pop();
    ptgfx.pop().destroy();
    renderer.render(stage);
}