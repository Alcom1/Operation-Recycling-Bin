//Base game object
var GameObject = function(args) {

	args.position = args.position || {x : 0, y : 0}			//Default position

    this.gpos = new Vect(args.position.x, args.position.y);	//Grid position
	this.spos = new Vect(0,0);								//Sub position

	this.zIndex = args.zIndex != null ? args.zIndex : 0		//zIndex
	this.tag = args.tag || args.name;
}

//Set a New Scene to load it
GameObject.prototype.loadScene = function(newSceneName) {
	engine.main.pushScene(newSceneName);
}

//Game object update
GameObject.prototype.update = function(dt) {
	
}

//Game object draw
GameObject.prototype.draw = function(ctx) {
	
}

