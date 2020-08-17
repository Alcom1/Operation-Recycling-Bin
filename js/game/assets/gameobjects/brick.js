//Brick object
var Brick = function(args) { GameObject.call(this, args);

    this.color = args.color;            //The color of this brick
    this.isGrey = !args.color;          //If this is a static grey brick
    this.width = args.width || 1;       //Width of this brick

    this.isPressed = false;             //If we are pressing on this brick
    this.isSelected = false;            //If this brick is selected

    this.selectedPos = new Vect(0, 0)   //Relative selected position

    this.isGrounded = false;            //Temporary recursion state
    this.isChecked = false;             //Temporary recursion state
}

Brick.prototype = Object.create(GameObject.prototype);

Brick.prototype.update = function(dt) {
    if(this.isSelected) {
        this.spos = engine.managerMouse.getPos().getSub(this.selectedPos);
    }
}

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
}

//Setup this brick for selecting
Brick.prototype.select = function(pos) {
    this.isSelected = true; 
    this.selectedPos.set(pos);
}

//Clear this brick's selection states
Brick.prototype.clearSelection = function() {
    this.isPressed = false; 
    this.isSelected = false;
    this.spos.set(0, 0);        //Reset position
}

//Clear this brick's recursion states
Brick.prototype.clearRecursion = function() {
    this.isGrounded = false;
    this.isChecked = false;
}