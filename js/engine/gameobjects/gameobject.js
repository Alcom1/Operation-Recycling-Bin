//Base game object
var GameObject = function(args) {

    this.gpos = new Vect(args.position.x, args.position.y);	//Grid position
	this.spos = new Vect(0,0);								//Sub position

	this.zIndex = args.zIndex != null ? args.zIndex : 0		//zIndex
	this.tag = args.tag;
}

//Set a New Scene to load it
GameObject.prototype.loadScene = function(newSceneName) {
	engine.main.pushScene(newSceneName);
}

//Game object update
GameObject.prototype.update = function(dt, gPos) {
	
}

//Game object draw
GameObject.prototype.draw = function(ctx) {
	
}

