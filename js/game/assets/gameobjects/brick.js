//Brick object
var Brick = function(args) { GameObject.call(this, args);

    this.color = args.color || "Grey";
    this.isGrey = !args.color
    this.width = args.width || 1;
    this.isChecked = false;
}

Brick.prototype = Object.create(GameObject.prototype);

//Game object draw
Brick.prototype.draw = function(ctx) {
    ctx.fillStyle = this.color
    ctx.fillRect(
        1, 
        1, 
        this.width * engine.math.gmultx - 2, 
        engine.math.gmulty - 2);
}