//Brick object
var Brick = function(args) { GameObject.call(this, args);

    this.color = engine.math.colorTranslate(args.color);        //The color of this brick
    this.colorDark = null;
    this.colorBright = null;

    this.image = null;                                          //Baked image data for this brick

    this.isGrey = !args.color;          //If this is a static grey brick
    this.width = args.width || 1;       //Width of this brick

    this.zIndex = this.gpos.x - this.gpos.y * 100 + this.width; //Z-sort vertically and then horizontally.

    this.isPressed = false;             //If we are pressing on this brick
    this.isSelected = false;            //If this brick is selected

    this.selectedPos = new Vect(0, 0)   //Relative selected position

    this.isGrounded = false;            //Temporary recursion state
    this.isChecked = false;             //Temporary recursion state

    this.studs = [];

    for(var i = 0; i < this.width; i++) {
        this.studs.push(new BrickStud({ 
            ...args, 
            position : {
                x : args.position.x + i, 
                y : args.position.y - 1
            }
        }));
        this.parent.pushGO(this.studs[i]);
    }

}

Brick.prototype = Object.create(GameObject.prototype);

Brick.prototype.init = function(ctx) {
    
    //Initialize colors
    ctx.fillStyle = this.color;

    this.colorDark = engine.math.colorMult(ctx.fillStyle, 0.625);
    this.colorBright = engine.math.colorAdd(ctx.fillStyle, 48);

    //Bake image of brick
    this.image = new Image;
    this.image.src = engine.baker.bake(
        this, 
        this.drawBrick, 
        this.width * engine.math.gmultx + 12,
        32,
        "BRICK." + this.width + "." + this.color);
}

Brick.prototype.update = function(dt) {
    if(this.isSelected) {

        //Poisition based difference between stored selected position and new cursor position
        this.spos = engine.mouse.getPos().getSub(this.selectedPos);

        //Grid positioning
        this.spos.sub({
            x : this.spos.x % engine.math.gmultx,
            y : this.spos.y % engine.math.gmulty
        });

        //Set studs to match the position of this brick while selected.
        this.resetStuds();
    }
}

//Game object draw
Brick.prototype.draw = function(ctx) {
    
    //Global transparency for selection states
    ctx.globalAlpha =
        this.isPressed ? 0.8 :
        this.isSelected ? 0.5 :
        1.0;
    
    //Draw the stored image for this brick
    ctx.drawImage(this.image, 0, -engine.math.drawOffset);
}

//Reset studs to match the position of this brick
Brick.prototype.resetStuds = function() {
    this.studs.forEach((s, i) => {
        s.gpos.set(this.gpos.x + i, this.gpos.y - 1);
        s.spos.set(this.spos);
    });
}

//Setup this brick for pressing
Brick.prototype.press = function() {
    this.isPressed = true;
    this.studs.forEach(s => s.press());
}

//Setup this brick for selecting
Brick.prototype.select = function(pos) {
    this.isSelected = true; 
    this.selectedPos.set(pos);
    this.zIndex = engine.math.subCursorZIndex;
    this.studs.forEach(s => s.select());
}

//Clear this brick's selection states
Brick.prototype.deselect = function() {
    if(this.isSelected) {
        this.gpos.set(
            this.gpos.x + Math.round(this.spos.x / engine.math.gmultx),
            this.gpos.y + Math.round(this.spos.y / engine.math.gmulty))
    }
    this.isPressed = false; 
    this.isSelected = false;
    this.spos.set(0, 0);                                        //Reset position
    this.selectedPos.set(0, 0);
    this.zIndex = this.gpos.x - this.gpos.y * 100 + this.width; //Set z-index
    this.resetStuds();                                          //Reset studs to match the final brick position
    this.studs.forEach(s => s.deselect());                //Clear stud selection states.
}

//Clear this brick's recursion states
Brick.prototype.clearRecursion = function() {
    this.isGrounded = false;
    this.isChecked = false;
}

Brick.prototype.drawBrick = function(ctx) {

    //Offset for baked drawing.
    ctx.translate(0, engine.math.drawOffset);

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

    //Grey holes
    if(this.isGrey) {
        for(j = 1; j < this.width; j++) {
            
            var xoff = engine.math.gmultx * j

            //Hole border
            ctx.beginPath();
            ctx.arc(2 + xoff, 8, 5.5, 0, 2 * Math.PI);
            ctx.stroke();

            //Hole center style
            ctx.fillStyle = this.colorDark;

            //Hole center
            ctx.beginPath();
            ctx.arc(2 + xoff, 8, 3.5, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}