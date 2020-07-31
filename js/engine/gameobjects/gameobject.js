//Base game object
var GameObject = function(args, nextScene) {

	this.gpos = new Vect(0,0);		//Grid position
	this.spos = new Vect(0,0);		//Sub position

	this.zIndex = args.zIndex != null ? args.zIndex : 0	//zIndex compared to sibling objects.
	this.tag = args.tag;

	this.nextScene = nextScene;

    this.parent = args.parent;
}

//Set a New Scene to load it
GameObject.prototype.loadScene = function(newSceneName) {
	this.nextScene.sceneName = newSceneName;
}

//Game object update
GameObject.prototype.update = function(dt, gPos) {
	
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

