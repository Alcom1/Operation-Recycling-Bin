//Brick object
var Brick = function(args) { GameObject.call(this, args);

    this.color = args.color;        //The color of this brick
    this.isGrey = !args.color;      //If this is a static grey brick
    this.width = args.width || 1;   //Width of this brick

    this.isPressed = false;         //If we are pressing on this brick
    this.isSelected = false;        //If this brick is selected

    this.isGrounded = false;        //Temporary recursion state
    this.isChecked = false;         //Temporary recursion state
    this.number = 0;                //Debug
}

Brick.prototype = Object.create(GameObject.prototype);

//Game object draw
Brick.prototype.draw = function(ctx) {
    ctx.fillStyle = 
        this.isSelected ? "White" : 
        this.isPressed ? "#CCC" :
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

//Clear this brick's selection states
Brick.prototype.clearSelection = function() {
    this.isPressed = false; 
    this.isSelected = false; 
}

//Clear this brick's recursion states
Brick.prototype.clearRecursion = function() {
    this.isGrounded = false;
    this.isChecked = false;
}