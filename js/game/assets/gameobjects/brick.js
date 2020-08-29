//Brick object
var Brick = function(args) { GameObject.call(this, args);

    this.color = engine.math.colorTranslate(args.color);        //The color of this brick
    this.colorDark = null;
    this.colorBright = null;

    this.image = null;                                          //Baked image data for this brick

    this.isGrey = !args.color;          //If this is a grey brick
    this.isStatic = false;              //If this is a static brick that will never move (grey or blocked by grey bricks), calculated later
    this.width = args.width || 1;       //Width of this brick

    this.zIndex = this.gpos.x * 2 - this.gpos.y * 100 + this.width * 2; //Z-sort vertically and then horizontally.

    this.isPressed = false;             //If we are pressing on this brick
    this.isSelected = false;            //If this brick is selected

    this.selectedPos = new Vect(0, 0)   //Relative selected position

    this.isGrounded = false;            //Temporary recursion state
    this.isChecked = false;             //Temporary recursion state

    this.studs = [];

    //Generate studs across the width of this brick
    for(var i = 0; i < this.width; i++) {

        //Create new stud
        this.studs.push(new BrickStud({ 
            ...args, 
            position : {                 //Unique stud position
                x : args.position.x + i, //Studs go across the brick
                y : args.position.y - 1  //Studs are above the brick
            }
        }));

        //Add stud to game objects.
        this.parent.pushGO(this.studs[i]);
    }

}

Brick.prototype = 
Object.create(GameObject.prototype);
Object.assign(Brick.prototype, {

    //Initialize a game object after its scene is loaded.
    init : function(ctx, scenes) {
        
        //Initialize colors
        ctx.fillStyle = this.color;

        this.colorDark = engine.math.colorMult(ctx.fillStyle, 0.625);
        this.colorBright = engine.math.colorAdd(ctx.fillStyle, 48);

        //Bake image of brick
        this.image = new Image;
        this.image.src = engine.baker.bake(
            this, 
            this.drawBrick, 
            this.width * engine.math.gmultx + engine.math.zDepth + 3,
            engine.math.gmulty + engine.math.zDepth + 3,
            "BRICK." + this.width + "." + this.color);
    },

    //Game object update
    update : function(dt) {

        //Follow mouse if selected
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
    },

    //Game object draw
    draw : function(ctx) {
        
        //Global transparency for selection states
        ctx.globalAlpha =
            this.isPressed ? 0.8 :
            this.isSelected ? 0.5 :
            1.0;
        
        //Draw the stored image for this brick
        ctx.drawImage(this.image, 0, -engine.math.zDepth - 3);
    },

    //Reset studs to match the position of this brick
    resetStuds : function() {
        this.studs.forEach((s, i) => {
            s.gpos.set(this.gpos.x + i, this.gpos.y - 1);
            s.spos.set(this.spos);
        });
    },

    //Setup this brick for pressing
    press : function() {

        //Can't press grey bricks
        if(!this.isStatic) {
            this.isPressed = true;
            this.studs.forEach(s => s.press());
        }
    },

    //Setup this brick for selecting
    select : function(pos) {
        this.isSelected = true; 
        this.selectedPos.set(pos);
        this.zIndex = engine.math.underCursorZIndex;
        this.studs.forEach(s => s.select());
    },

    //Clear this brick's selection states
    deselect : function() {
        if(this.isSelected) {
            this.gpos.set(
                this.gpos.x + Math.round(this.spos.x / engine.math.gmultx),
                this.gpos.y + Math.round(this.spos.y / engine.math.gmulty))
        }
        this.isPressed = false; 
        this.isSelected = false;
        this.spos.set(0, 0);                                                //Reset position
        this.selectedPos.set(0, 0);
        this.zIndex = this.gpos.x * 2 - this.gpos.y * 100 + this.width * 2; //Set z-index
        this.resetStuds();                                                  //Reset studs to match the final brick position
        this.studs.forEach(s => s.deselect());                              //Clear stud selection states.
    },

    //Clear this brick's recursion states
    clearRecursion : function() {
        this.isGrounded = false;
        this.isChecked = false;
    },

    drawBrick : function(ctx) {

        //Offset for baked drawing.
        ctx.translate(2, engine.math.zDepth + 3);

        //Base rectangle color
        ctx.fillStyle = this.color;

        //Base rectangle
        ctx.fillRect(
            0, 
            0, 
            this.width * engine.math.gmultx, 
            engine.math.gmulty);

        //Border style
        ctx.strokeStyle = this.colorDark;
        ctx.lineWidth = engine.math.lineWidth;
        ctx.lineCap = "square";

        //Border
        ctx.beginPath();
        ctx.moveTo(engine.math.lineWidth / 2,       0);
        ctx.lineTo(engine.math.lineWidth / 2,       engine.math.gmulty - engine.math.lineWidth / 2);
        ctx.lineTo(this.width * engine.math.gmultx, engine.math.gmulty - engine.math.lineWidth / 2);
        ctx.stroke();

        //Right face style
        ctx.fillStyle = this.colorDark;

        //Right face
        ctx.beginPath();
        ctx.moveTo(this.width * engine.math.gmultx,                         engine.math.gmulty);
        ctx.lineTo(this.width * engine.math.gmultx,                         0);
        ctx.lineTo(this.width * engine.math.gmultx + engine.math.zDepth,                       - engine.math.zDepth);
        ctx.lineTo(this.width * engine.math.gmultx + engine.math.zDepth,    engine.math.gmulty - engine.math.zDepth);
        ctx.fill();

        //Top face style
        ctx.fillStyle = this.colorBright;

        //Top face
        ctx.beginPath();
        ctx.moveTo(0,                                                       0);
        ctx.lineTo(                                  engine.math.zDepth,    -engine.math.zDepth);
        ctx.lineTo(this.width * engine.math.gmultx + engine.math.zDepth,    -engine.math.zDepth);
        ctx.lineTo(this.width * engine.math.gmultx,                         0);
        ctx.fill();

        //Grey holes
        if(this.isGrey) {

            for(j = 1; j < this.width; j++) {
                
                var xoff = engine.math.gmultx * j
                var yoff = Math.ceil(engine.math.gmulty * 0.4);

                //Hole border
                ctx.beginPath();
                ctx.arc(xoff, yoff, engine.math.studRadius, 0, 2 * Math.PI);
                ctx.stroke();

                //Hole center style
                ctx.fillStyle = this.colorDark;

                //Hole center
                ctx.beginPath();
                ctx.arc(xoff, yoff, engine.math.studRadius * 0.64, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    }
});