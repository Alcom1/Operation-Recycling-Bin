//Brick object
var Brick = function(args) { GameObject.call(this, args);

    this.color = args.color || "white";
    this.width = args.width || 1;
}

Brick.prototype = Object.create(GameObject.prototype);

//Game object draw
Brick.prototype.draw = function(ctx) {
    ctx.fillStyle = this.color
    ctx.fillRect(
        2, 
        2, 
        this.width * engine.math.gmultx - 4, 
        engine.math.gmulty - 4);
}