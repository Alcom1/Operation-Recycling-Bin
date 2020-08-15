//Brick object
var Brick = function(args) { GameObject.call(this, args);

    this.color = args.color;
    this.isGrey = !args.color;
    this.width = args.width || 1;
    this.isSelected = false;
    this.isStopping = false;        //Temporary selection recursion state
    this.isChecked = false;         //Temporary selection recursion state
    this.number = 0;                //Debug
}

Brick.prototype = Object.create(GameObject.prototype);

//Game object draw
Brick.prototype.draw = function(ctx) {
    ctx.fillStyle = this.isSelected ? "White" : this.isGrey ? "Grey" : this.color
    ctx.fillRect(
        1, 
        1, 
        this.width * engine.math.gmultx - 2, 
        engine.math.gmulty - 2);

    ctx.font = "Consolas";
    ctx.fillStyle = "black"; 
    ctx.fillText(this.number, 4, 12);
}