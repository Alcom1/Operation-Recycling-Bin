//Level sequence game object
var LevelSequence = function(args) { GameObject.call(this, args);

    this.font = args.font || "18pt Consolas";                   //Font and default font
    this.color = args.color || "white";                         //Color and default color
    this.levelName = args.levelName;

    //Map levels to array of name-level objects
    this.levels = Object.entries(args.levels ?? {}).map(l => ({ //Map entries
        label : l[0],                                           //Level label
        level : l[1]                                            //Level name
    }));
}

//Level sequence prototype
LevelSequence.prototype = 
Object.create(GameObject.prototype);
Object.assign(LevelSequence.prototype, {

    //Game object draw
    draw : function(ctx) {
        
        ctx.textBaseline = "top";           //Top baseline
        ctx.textAlign = "right";            //Right align
        ctx.font = this.font;               //Font
        ctx.fillStyle = this.color;         //Color
        ctx.fillText(this.levelName, 0, 1); //Fill level name text
    }
});