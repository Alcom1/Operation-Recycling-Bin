//Scene
var Scene = function(args) {
	
	this.name = args.name != null ? args.name : "nameless"
    this.zIndex = args.zIndex != null ? args.zIndex : 0		//zIndex
	this.gameObjects = [];
	this.newScene = "";
}

//Clear
Scene.prototype.clear = function() {
	
	this.gameObjects = [];
}

//Push Game Object
Scene.prototype.push = function(gameObject) {
	
	this.pushinit(gameObject);
	this.sort(gameObject);
}

//Push initial Game Object without sorting it.
Scene.prototype.pushinit = function(gameObject) {
	
	this.gameObjects.push(gameObject);
}

//Sort Game Objects
Scene.prototype.sort = function()
{
	//Sort game objects by z-index.
	this.gameObjects.sort(
		function(a, b) {
	
			if(a.zIndex == b.zIndex)
				return 0;
			
			return a.zIndex > b.zIndex;
		});
}

//Set a New Scene to load it
Scene.prototype.loadScene = function(newScene) {
	this.newScene = newScene;
}

//Scene update
Scene.prototype.update = function(dt) {
	
	for(var i = 0; i < this.gameObjects.length; i++) {
        
		this.gameObjects[i].update(dt, null);
	}
}

//Scene draw
Scene.prototype.draw = function(ctx) {
	
	for(var i = 0; i < this.gameObjects.length; i++) {
		var gameObject = this.gameObjects[i];
		ctx.save();
			ctx.translate(
				gameObject.gpos.x * engine.math.gmultx + gameObject.spos.x, 
				gameObject.gpos.y * engine.math.gmulty + gameObject.spos.y);
			gameObject.draw(ctx);
		ctx.restore();
	}
}