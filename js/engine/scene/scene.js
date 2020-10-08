//Scene
var Scene = function(args) {
    
    this.name = args.name || "nameless";                //Name of this scene
    this.need = args.need || [];                        //Required scenes for this scene to initialize
    this.zIndex = args.zIndex != null ? args.zIndex : 0 //zIndex
    this.gameObjects = [];                              //Game Objects in this scene
    this.initialized = false;                           //If this scene has been initialized
}

//Scene
Scene.prototype = {

    //Initialize all game objects in this scene
    init : function(ctx, scenes) {

        if (!this.initialized && 
            this.need.every(n => engine.tag.exists(n))) {

            ctx.save();
                this.gameObjects.forEach(go =>  go.init(ctx, scenes));
            ctx.restore();

            this.initialized = true;
        }
    },

    //Clear
    clear : function() {
        
        this.gameObjects = [];
    },

    //Push Game Object
    pushGO : function(gameObject) {
        
        gameObject.parent = this;            //Establish parent scene before pushing
        this.gameObjects.push(gameObject);
    },

    //Sort Game Objects
    sortGO : function() {

        //Sort game objects by z-index.
        this.gameObjects.sort((a, b) => a.zIndex - b.zIndex);
    },

    //Scene update
    update : function(dt) {

        if(this.initialized) {

            this.gameObjects.forEach(go =>  go.update(dt));
        }
    },

    //Scene draw
    draw : function(ctx) {
        
        if(this.initialized) {

            this.gameObjects.forEach(go => {
                ctx.save();
                    ctx.translate(
                    go.gpos.x * engine.math.gmultx + go.spos.x, 
                    go.gpos.y * engine.math.gmulty + go.spos.y);
                    go.draw(ctx);
                ctx.restore();
            });
        }
    }
}