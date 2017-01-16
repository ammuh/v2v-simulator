//Aliases

var Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite;

var renderer = autoDetectRenderer(720, 720, {antialias: true, resolution: 1});
var stage = new Container();
renderer.render(stage);
document.body.appendChild(renderer.view);