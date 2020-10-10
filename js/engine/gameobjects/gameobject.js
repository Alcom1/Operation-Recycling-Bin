//Base game object
var GameObject = function(args) {

    this.gpos = new Vect(               //Grid position
        args.position?.x || 0,          //Grid position-x
        args.position?.y || 0);         //Grid position-y

    this.spos = new Vect(               //Sub position
        args.subPosition?.x || 0,       //Sub position-x
        args.subPosition?.y || 0);      //Sub position-y

    this.zIndex = args.zIndex || 0;     //zIndex
    this.tag = args.tag || args.name;   //Tag based on tag or name

    this.parent = args.scene;           //Parent scene
}

//GameObject prototype
GameObject.prototype = {

    //Initialize a game object after its scene is loaded.
    init : function(ctx, scenes) {

    },

    //Compare two objects, return true if they are the same
    compare : function(gameObject) {

        return gameObject.gpos.x == this.gpos.x && gameObject.gpos.y == this.gpos.y;    //Default compare uses grid positions
    },

    //Game object update
    update : function(dt) {
        
    },

    //Game object draw
    draw : function(ctx) {
        
    }
}