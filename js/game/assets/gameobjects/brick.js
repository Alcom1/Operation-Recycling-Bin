//Brick object
var Brick = function(args) { GameObject.call(this, args);

    this.color = engine.math.colorTranslate(args.color);    //The color of this brick
    this.colorDark = null;                                  //The shaded color of this brick
    this.colorBright = null;                                //The bright color of this brick

    this.image = new Image;                                 //Baked image data for this brick

    this.isGrey = !args.color;                              //If this is a grey brick
    this.isStatic = false;                                  //If this is a static brick that will never move (grey or blocked by grey bricks), calculated later
    this.width = args.width || 1;                           //Width of this brick

    this.zIndex =                                           //Z-sort vertically and then horizontally.
        this.gpos.x * 2 -                                   //2x multiplier for stud overlap
        this.gpos.y * 100 +                                 //Y-pos has priority over X-pos.
        this.width * 2;                                     //2x width added for stud overlap

    this.isPressed = false;                                 //If we are pressing on this brick
    this.isSelected = false;                                //If this brick is selected
    this.isSnapped = false;                                 //If this brick is snapped to a position

    this.selectedPos = new Vect(0, 0)                       //Relative selected position

    this.isGrounded = false;                                //Temporary recursion state
    this.isChecked = false;                                 //Temporary recursion state

    this.studs = [];                                        //The stud objects for this brick

    //Generate studs across the width of this brick
    for(var i = 0; i < this.width; i++) {                   //For each width unit of this brick

        //Create new stud
        this.studs.push(new BrickStud({                     //Push a new stud gameobject to this brick
            ...args,                                        //Apply this brick's studs
            position : {                                    //Stud has a different position than its parent brick
                x : args.position.x + i,                    //Studs go across the brick
                y : args.position.y - 1                     //Studs are above the brick
            }
        }));

        //Add stud to game objects.
        this.parent.pushGO(this.studs[i]);                  //Push stud gameobject to scene
    }

}

//Brick prototype
Brick.prototype = 
Object.create(GameObject.prototype);
Object.assign(Brick.prototype, {

    //Initialize a game object after its scene is loaded.
    init : function(ctx, scenes) {
        
        //Initialize colors
        ctx.fillStyle = this.color;                                     //ctx fill style will be a hex color for good math

        this.colorDark = engine.math.colorMult(ctx.fillStyle, 0.625);   //Calculate dark color
        this.colorBright = engine.math.colorAdd(ctx.fillStyle, 48);     //calculate bright color

        //Bake image of brick
        this.image.src = engine.baker.bake(                             //Set image src from baking results
            this,                                                       //Bake for this brick
            this.drawBrick,                                             //Draw brick for baked image
            this.width * engine.math.gmultx + engine.math.zDepth + 3,   //Width to contain the brick, the right face, and the border
            engine.math.gmulty + engine.math.zDepth + 3,                //Height to contain the brick, the top face, and the border
            "BRICK." + this.width + "." + this.color);                  //Tag image as a brick with color and width
    },

    //Game object update
    update : function(dt) {

        //Follow mouse if selected
        if(this.isSelected) {                                               //If this brick is selected

            //Poisition based difference between stored selected position and new cursor position
            this.spos = engine.mouse.getPos().getSub(this.selectedPos);     //Brick position is its position relative to the cursor

            //Grid positioning
            if(this.isSnapped) {                                            //If this brick should be snapped to position

                this.spos.set({                                             //Snap position
                    x : engine.math.round(this.spos.x, engine.math.gmultx), //Snapped x distance
                    y : engine.math.round(this.spos.y, engine.math.gmulty)  //Snapped y distance
                });
            }

            //Reset studs
            this.resetStuds();                                              //Set studs to match the position of this brick while selected. 
        }
    },

    //Game object draw
    draw : function(ctx) {
        
        //Global transparency for selection states
        ctx.globalAlpha =
            this.isPressed ? 0.8 :                              //Pressed brick is even less transparent
            this.isSnapped ? 0.7 :                              //Snapped brick is less transparent
            this.isSelected ? 0.3 :                             //Selected bricks are transparent
            1.0;                                                //Otherwise opaque if not selected or pressed
        
        //Draw the stored image for this brick
        ctx.drawImage(this.image, 0, -engine.math.zDepth - 3);  //Draw with vertical offset for top face
    },

    //Reset studs to match the position of this brick
    resetStuds : function() {
        this.studs.forEach((s, i) => {                      //For each of this bricks studs
            s.gpos.set(this.gpos.x + i, this.gpos.y - 1);   //Set stud global pos to match this brick
            s.spos.set(this.spos);                          //Set stud sub pos to match this brick
        });
    },

    //Setup this brick for pressing
    press : function() {

        //Can't press static bricks
        if(!this.isStatic) {                    //If this brick is not static
            this.isPressed = true;              //Press this brick
            this.studs.forEach(s => s.press()); //Press studs for transparency
        }
    },

    //Setup this brick for selecting
    select : function(pos) {

        this.isSelected = true;                         //Select this brick
        this.isChecked = true;                          //Check so this brick is ignored for float checks
        this.selectedPos.set(pos);                      //Store mouse's current position for relative calculations later
        this.zIndex = engine.math.underCursorZIndex;    //Set z-index to draw this brick under the cursor
        this.studs.forEach(s => s.select());            //Select studs for transparency
    },

    //Clear this brick's selection states
    deselect : function() {

        //Restore grid position for deselection
        if(this.isSelected) {                                               //If this brick is selected
            this.gpos.set(                                                  //Snap sub position to the grid for the new position
                this.gpos.x + Math.round(this.spos.x / engine.math.gmultx), //X position
                this.gpos.y + Math.round(this.spos.y / engine.math.gmulty)) //Y position
        }

        //Restore states & values
        this.isPressed = false;                                             //Depress brick :(
        this.isSelected = false;                                            //Deselect brick
        this.isSnapped = false;                                             //Unsnap brick
        this.spos.set(0, 0);                                                //Zero sub position
        this.selectedPos.set(0, 0);                                         //Zero selected position
        this.zIndex = this.gpos.x * 2 - this.gpos.y * 100 + this.width * 2; //Set z-index
        this.resetStuds();                                                  //Reset studs to match the final brick position
        this.studs.forEach(s => s.deselect());                              //Clear stud selection states.
    },

    //Clear this brick's recursion states
    clearRecursion : function() {
        this.isGrounded = false;    //Unmark brick as grounded
        this.isChecked = false;     //Unmark brick as checked
    },

    //Draw this brick
    drawBrick : function(ctx) {

        //Offset for baked drawing.
        ctx.translate(2, engine.math.zDepth + 3);   //Offset for top face and borders

        //Base rectangle color
        ctx.fillStyle = this.color;                 //Fill base color

        //Front face
        ctx.fillRect(                               //Rectangle for front face
            0,                                      //Origin
            0,                                      //Origin
            this.width * engine.math.gmultx,        //Brick width
            engine.math.gmulty);                    //Brick height

        //Border style
        ctx.strokeStyle = this.colorDark;           //Stroke dark color
        ctx.lineWidth = engine.math.lineWidth;      //Line width
        ctx.lineCap = "square";                     //Square corners

        //Border
        ctx.beginPath();                                                                                                //Start path
        ctx.moveTo(engine.math.lineWidth / 2,       0);                                                                 //Upper left corner
        ctx.lineTo(engine.math.lineWidth / 2,       engine.math.gmulty - engine.math.lineWidth / 2);                    //Lower left corner
        ctx.lineTo(this.width * engine.math.gmultx, engine.math.gmulty - engine.math.lineWidth / 2);                    //Lower right corner
        ctx.stroke();                                                                                                   //Draw border

        //Right face style
        ctx.fillStyle = this.colorDark;             //Fill dark color

        //Right face
        ctx.beginPath();                                                                                                //Start path
        ctx.moveTo(this.width * engine.math.gmultx,                         engine.math.gmulty);                        //Lower left corner
        ctx.lineTo(this.width * engine.math.gmultx,                         0);                                         //Upper left corner
        ctx.lineTo(this.width * engine.math.gmultx + engine.math.zDepth,                       - engine.math.zDepth);   //Upper right corner
        ctx.lineTo(this.width * engine.math.gmultx + engine.math.zDepth,    engine.math.gmulty - engine.math.zDepth);   //Lower right corner
        ctx.fill();                                                                                                     //Fill right face

        //Top face style
        ctx.fillStyle = this.colorBright;           //Fill bright color

        //Top face
        ctx.beginPath();                                                                            //Start path    
        ctx.moveTo(0,                                                       0);                     //Lower left corner
        ctx.lineTo(                                  engine.math.zDepth,    -engine.math.zDepth);   //Upper left corner
        ctx.lineTo(this.width * engine.math.gmultx + engine.math.zDepth,    -engine.math.zDepth);   //Upper right corner
        ctx.lineTo(this.width * engine.math.gmultx,                         0);                     //Lower right corner
        ctx.fill();                                                                                 //Fill top face

        //Grey holes
        if(this.isGrey) {                                                               //If this brick is grey

            //Y-offset
            var yoff = Math.ceil(engine.math.gmulty * 0.4);                             //All holes share the same Y-offset

            //Draw hole for each brick width, except for the last one
            for(j = 1; j < this.width; j++) {                                           //Across the width of the brick
                
                //X-offset
                var xoff = engine.math.gmultx * j;                                      //X-offset increases for each hole

                //Hole border
                ctx.beginPath();                                                        //Start path
                ctx.arc(xoff, yoff, engine.math.studRadius, 0, 2 * Math.PI);            //Circle outer hole
                ctx.stroke();                                                           //Stroke outer hole

                //Hole center style
                ctx.fillStyle = this.colorDark;     //Fill dark color

                //Hole center
                ctx.beginPath();                                                        //Start path
                ctx.arc(xoff, yoff, engine.math.studRadius * 0.64, 0, 2 * Math.PI);     //Circle inner hole
                ctx.fill();                                                             //Fill inner hole
            }
        }
    }
});