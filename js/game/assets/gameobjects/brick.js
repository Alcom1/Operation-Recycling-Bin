//Brick object
var Brick = function(args) { GameObject.call(this, args);

    this.color = args.color;        //The color of this brick
    this.isGrey = !args.color;      //If this is a static grey brick
    this.width = args.width || 1;   //Width of this brick
    this.isSelected = false;        //If this brick is selected
    this.isAnti = false;            //Temporary recursion state
    this.isChecked = false;         //Temporary recursion state
    this.number = 0;                //Debug
}

Brick.prototype = Object.create(GameObject.prototype);

//Game object draw
Brick.prototype.draw = function(ctx) {
    ctx.fillStyle = 
        this.isSelected ? "White" : 
        this.isGrey ? "Grey" :
        this.color
    ctx.fillRect(
        1, 
        1, 
        this.width * engine.math.gmultx - 2, 
        engine.math.gmulty - 2);

    ctx.font = "Consolas";
    ctx.fillStyle = "black"; 
    ctx.fillText(this.number, 4, 12);
}