//Base game object
var GameObject = function(args) {

	this.gpos = new Vect(0,0);		//Grid position
	this.spos = new Vect(0,0);		//Sub position

	if(args.zIndex != null) {		//zIndex compared to sibling objects.
		this.zIndex = args.zIndex;
	}
	else {
		this.zIndex = 0;
	}
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

//
GameObject.prototype.pushGO = function(gameObject) {
	this.parent.pushGO(gameObject);
}

//Game object collision
GameObject.prototype.collide = function(other, pos) {
	
}

