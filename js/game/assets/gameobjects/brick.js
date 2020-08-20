//Brick object
var Brick = function(args) { GameObject.call(this, args);

    this.color = engine.math.colorTranslate(args.color);    //The color of this brick
    this.colorDark = null;
    this.colorBright = null;

    this.zIndex = this.gpos.x - this.gpos.y * 100;          //Z-sort vertically and then horizontally.

    this.isGrey = !args.color;          //If this is a static grey brick
    this.width = args.width || 1;       //Width of this brick

    this.isPressed = false;             //If we are pressing on this brick
    this.isSelected = false;            //If this brick is selected

    this.selectedPos = new Vect(0, 0)   //Relative selected position

    this.isGrounded = false;            //Temporary recursion state
    this.isChecked = false;             //Temporary recursion state
}

Brick.prototype = Object.create(GameObject.prototype);

Brick.prototype.init = function(ctx) {
    
    //Initialize colors
    ctx.fillStyle = this.color;

    this.colorDark = engine.math.colorMult(ctx.fillStyle, 0.625);
    this.colorBright = engine.math.colorAdd(ctx.fillStyle, 48);
}

Brick.prototype.update = function(dt) {
    if(this.isSelected) {

        //Poisition based difference between stored selected position and new cursor position
        this.spos = engine.managerMouse.getPos().getSub(this.selectedPos);

        //Grid positioning
        this.spos.sub({
            x : this.spos.x % engine.math.gmultx,
            y : this.spos.y % engine.math.gmulty
        })
    }
}

//Game object draw
Brick.prototype.draw = function(ctx) {

    //Global transparency for selection states
    ctx.globalAlpha =
        this.isPressed ? 0.8 :
        this.isSelected ? 0.5 :
        1.0;

    //Base rectangle color
    ctx.fillStyle = this.color;

    //Base rectangle
    ctx.fillRect(
        2, 
        0, 
        this.width * engine.math.gmultx, 
        engine.math.gmulty);

    //Border style
    ctx.strokeStyle = this.colorDark;
    ctx.lineWidth = 1;
    ctx.lineCap = "square";

    //Border
    ctx.beginPath();
    ctx.moveTo(1.5, 0);
    ctx.lineTo(1.5, engine.math.gmulty - 0.5);
    ctx.lineTo(this.width * engine.math.gmultx + 2, engine.math.gmulty - 0.5);
    ctx.stroke();

    //Right face style
    ctx.fillStyle = this.colorDark;

    //Right face
    ctx.beginPath();
    ctx.moveTo(this.width * engine.math.gmultx + 2, engine.math.gmulty + 0);
    ctx.lineTo(this.width * engine.math.gmultx + 2, 0);
    ctx.lineTo(this.width * engine.math.gmultx + 13, -11);
    ctx.lineTo(this.width * engine.math.gmultx + 13, engine.math.gmulty - 11);
    ctx.fill();

    //Top face style
    ctx.fillStyle = this.colorBright;

    //Top face
    ctx.beginPath();
    ctx.moveTo(2, 0);
    ctx.lineTo(13, -11);
    ctx.lineTo(this.width * engine.math.gmultx + 13, -11);
    ctx.lineTo(this.width * engine.math.gmultx + 2, 0);
    ctx.fill();
}

//Setup this brick for selecting
Brick.prototype.select = function(pos) {
    this.isSelected = true; 
    this.selectedPos.set(pos);
    this.zIndex = 49000;
}

//Clear this brick's selection states
Brick.prototype.clearSelection = function() {
    if(this.isSelected) {
        this.gpos.set(
            this.gpos.x + Math.round(this.spos.x / engine.math.gmultx),
            this.gpos.y + Math.round(this.spos.y / engine.math.gmulty))
    }
    this.isPressed = false; 
    this.isSelected = false;
    this.spos.set(0, 0);                            //Reset position
    this.selectedPos.set(0, 0);
    this.zIndex = this.gpos.x - this.gpos.y * 100;  //Set z-index
}

//Clear this brick's recursion states
Brick.prototype.clearRecursion = function() {
    this.isGrounded = false;
    this.isChecked = false;
}