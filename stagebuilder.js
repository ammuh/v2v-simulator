var Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    Text = PIXI.Text,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    Graphics = PIXI.Graphics;
var width = 720;
var height = 720;
//Creates window in browser 720 by 720
var renderer = autoDetectRenderer(width, height, 
	{resolution: 1});
var stage = new Container();
document.body.appendChild(renderer.view);
stage.interactive = true;

var graphics = new Graphics();

graphics.beginFill(0x000000);

// set the line style to have a width of 5 and set the color to red
graphics.lineStyle(0, 0xFF0000);


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
    gridLines = [];
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

var nm = false;
var init;
var guide;
var pthilite;

var ptgfx = [];
var points = [];

var ndgfx = [];
var ndptgfx = [];
var nodes = [];
var MAX_NODE_DIST = 30;
function onButtonDown(e){
    init = closestPoint(e);
    guide = new Graphics();
 
    if(!nm){
        guide.lineStyle(1, 0xFF0000, 1);
    }else{
        guide.lineStyle(1, 0x00FF00, 1);
    }
    
    // draw a triangle using lines
    guide.moveTo(init[0],init[1]);
    guide.lineTo(init[0],init[1]);
    // add it the stage so we see it on our screens..
    stage.addChild(guide);
    renderer.render(stage);
}

function onButtonUp(e){
    
    fin = closestPoint(e);
    
    if(fin[0] != init[0] || fin[1] != init[1]){
        if(!nm){
            var graphic = new Graphics();
            graphic.lineStyle(1, 0xFFFFFF, 1);
            graphic.moveTo(init[0],init[1]);
            points.push([[init[0],init[1]],[fin[0], fin[1]]]);
            ptgfx.push(graphic);
            graphic.lineTo(fin[0], fin[1]);
            stage.addChild(graphic);
        }else{            
            var pts = lineHalf([[init[0],init[1]],[fin[0], fin[1]]]);
            for(var i = 1; i < pts.length; i+= 2){
                var graphic = new Graphics();
                graphic.lineStyle(1, 0x0000FF, 1);
                graphic.moveTo(pts[i-1][0], pts[i-1][1]);
                graphic.lineTo(pts[i][0], pts[i][1]);
                stage.addChild(graphic);
                nodes.push([pts[i-1],pts[i]]);
                ndgfx.push(graphic);

                var pt1 = new PIXI.Graphics();
                pt1.beginFill(0x0000FF); 
                pt1.drawCircle(pts[i-1][0], pts[i-1][1], 3); // drawCircle(x, y, radius)
                pt1.endFill();
                var pt2 = new PIXI.Graphics();
                pt2.beginFill(0x0000FF); 
                pt2.drawCircle(pts[i][0], pts[i][1], 3); // drawCircle(x, y, radius)
                pt2.endFill();
                ndptgfx.push(pt1);
                ndptgfx.push(pt2);
                stage.addChild(pt1);
                stage.addChild(pt2);
            }
        }
    }
    guide.destroy();
    guide = undefined;
    renderer.render(stage);
}

function lineHalf(arr){
    if(math.distance([arr[0][0], arr[0][1]],[arr[1][0], arr[1][1]]) <= MAX_NODE_DIST){
        return arr;
    }else{
        var xm = (arr[0][0] + arr[1][0])/2;
        var ym = (arr[0][1] + arr[1][1])/2;
        var h1 = lineHalf([[arr[0][0], arr[0][1]],[xm, ym]]);
        var h2 = lineHalf([[xm,ym],[arr[1][0], arr[1][1]]]);
        return h1.concat(h2);
    }
}

function updateGuide(e){
    var cp = closestPoint(e);
    if(guide != undefined){
        guide.destroy();
        guide = new Graphics();

        if(!nm){
            guide.lineStyle(1, 0xFF0000, 1);
        }else{
            guide.lineStyle(1, 0x00FF00, 1);
        }
        
        guide.moveTo(init[0],init[1]);
        guide.lineTo(cp[0], cp[1]);
        
        stage.addChild(guide);
    }
    if(pthilite != undefined){
        stage.removeChild(pthilite);
        pthilite.destroy();
    }
    pthilite = new PIXI.Graphics();
    pthilite.beginFill(0xFF00FF); 
    pthilite.drawCircle(cp[0], cp[1], 3); 
    pthilite.endFill();
    stage.addChild(pthilite);
    renderer.render(stage);
}

function closestPoint(e){
    if(!nm){
        return [gridInc*Math.round(e.data.originalEvent.x/gridInc),gridInc*Math.round(e.data.originalEvent.y/gridInc)];
    }else{
        var sx = -100;
        var sy = -100;
        for(var i = 0; i < nodes.length; i++){
            if(math.distance([e.data.originalEvent.x, e.data.originalEvent.y], nodes[i][0]) <= 12 && math.distance([e.data.originalEvent.x, e.data.originalEvent.y], nodes[i][0]) < math.distance([e.data.originalEvent.x, e.data.originalEvent.y], [sx, sy])){
                sx = nodes[i][0][0];
                sy = nodes[i][0][1];
            }
            if(math.distance([e.data.originalEvent.x, e.data.originalEvent.y], nodes[i][1]) <= 12 && math.distance([e.data.originalEvent.x, e.data.originalEvent.y], nodes[i][1]) < math.distance([e.data.originalEvent.x, e.data.originalEvent.y], [sx, sy])){
                sx = nodes[i][1][0];
                sy = nodes[i][1][1];
            }
        }
        if(sx == -100 && sy == -100){
            sx = gridInc*Math.round(e.data.originalEvent.x/gridInc);
            sy = gridInc*Math.round(e.data.originalEvent.y/gridInc);
        }
        return [sx, sy];
    }
}

function keys(ev){
    var evtobj = window.event? event : ev
    if (evtobj.keyCode == 90 && evtobj.ctrlKey){
        undo();
    }else if(evtobj.keyCode == 78){
        nm = !nm;
        destroyGrid();
        if(nm){
            gridInc = 10;
        }else{
            gridInc = 20;
        }
        buildGrid();
        for(var i = 0; i < ptgfx.length; i++){
            stage.removeChild(ptgfx[i]);    
            stage.addChild(ptgfx[i]);
        }
        for(var i = 0; i < ndgfx.length; i++){
            stage.removeChild(ndgfx[i]);    
            stage.addChild(ndgfx[i]);
        }
        for(var i = 0; i < ndptgfx.length; i++){
            stage.removeChild(ndptgfx[i]);    
            stage.addChild(ndptgfx[i]);
        }
        renderer.render(stage);
    }else if(evtobj.keyCode == 189){
        gridDec();
    }
    else if(evtobj.keyCode == 187){
        gridAug();
    }else if(evtobj.keyCode == 68){
        dump();
    }
}

function undo(){
    if(!nm){
        points.pop();
        ptgfx.pop().destroy();
        renderer.render(stage);
    }else{
        nodes.pop();
        ndgfx.pop().destroy();
        ndptgfx.pop().destroy();
        ndptgfx.pop().destroy();
        renderer.render(stage);
    }
}

function dump(){
    var wedges = [[[0,0],[0, height]], [[0,height],[width, height]], [[width,height],[width, 0]], [[width,0],[0,0]]];
    var stobj = {
        points: points.concat(wedges),
        edges: nodes
    };

    console.log(JSON.stringify(stobj));
}