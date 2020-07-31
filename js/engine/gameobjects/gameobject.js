//Base game object
var GameObject = function(args) {

	this.gpos = new Vect(0,0);		//Grid position
	this.spos = new Vect(0,0);		//Sub position

	this.zIndex = args.zIndex != null ? args.zIndex : 0	//zIndex compared to sibling objects.
	this.tag = args.tag;

    this.parent = args.parent;
}

//Game object update
GameObject.prototype.update = function(dt, gPos) {
	
}

//Set a New Scene to load it
GameObject.prototype.loadScene = function(newScene) {
	this.parent.loadScene(newScene);
}

//Game object draw
GameObject.prototype.draw = function(ctx) {
	
}

//Add a new game object to the current game
GameObject.prototype.push = function(gameObject) {
	this.parent.push(gameObject);
}

//Game object collision
GameObject.prototype.collide = function(other, pos) {
	
}

