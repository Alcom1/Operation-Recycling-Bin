//Scene
var Scene = function() {

	this.gameObjects = [];
	this.newScene = "";
}

//Init
Scene.prototype.init = function() {
	
	this.gameObjects.push(new GameObject({ parent : this }));
}

//Clear
Scene.prototype.clear = function() {
	
	this.gameObjects = [];
}

//Push Game Object
Scene.prototype.pushGO = function(gameObject) {
	
	this.pushGOinit(gameObject);
	this.sortGO(gameObject);
}

//Push initial Game Object without sorting it.
Scene.prototype.pushGOinit = function(gameObject) {
	
	this.gameObjects.push(gameObject);
}

//Sort Game Objects
Scene.prototype.sortGO = function()
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
	
		this.gameObjects[i].update(dt, this.transform);
	}
}

//Scene draw
Scene.prototype.draw = function(ctx) {
	
	for(var i = 0; i < this.gameObjects.length; i++) {
		var gameObject = this.gameObjects[i];
		ctx.save();
			ctx.translate(
				gameObject.gpos.x * 15 + gameObject.spos.x, 
				gameObject.gpos.y * 18 + gameObject.spos.y);
			gameObject.draw(ctx);
		ctx.restore();
	}
}