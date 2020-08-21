//Scene
var Scene = function(args) {
	
	this.name = args.name != null ? args.name : "nameless"
    this.zIndex = args.zIndex != null ? args.zIndex : 0		//zIndex
	this.gameObjects = [];
	this.newScene = "";
}

//Initialize all game objects in this scene
Scene.prototype.init = function(ctx) {

	ctx.save();
		this.gameObjects.forEach(go =>  go.init(ctx));
	ctx.restore();
}

//Clear
Scene.prototype.clear = function() {
	
	this.gameObjects = [];
}

//Push Game Object
Scene.prototype.pushGO = function(gameObject) {
	
	gameObject.parent = this;			//Establish parent scene before pushing
	this.gameObjects.push(gameObject);
}

//Sort Game Objects
Scene.prototype.sort = function() {

	//Sort game objects by z-index.
	this.gameObjects.sort((a, b) => a.zIndex - b.zIndex);
}

//Set a New Scene to load it
Scene.prototype.loadScene = function(newScene) {

	this.newScene = newScene;
}

//Scene update
Scene.prototype.update = function(dt) {

	this.gameObjects.forEach(go =>  go.update(dt));
}

//Scene draw
Scene.prototype.draw = function(ctx) {
	
	this.gameObjects.forEach(go => {
		ctx.save();
			ctx.translate(
			go.gpos.x * engine.math.gmultx + go.spos.x, 
			go.gpos.y * engine.math.gmulty + go.spos.y);
			go.draw(ctx);
		ctx.restore();
	})
}