//Series of studs for a brick
var BrickStud = function(args) { GameObject.call(this, args);

    this.color = engine.math.colorTranslate(args.color);    //The color of this stud
    this.colorDark = null;                                  //The shaded color of this brick
    this.colorBright = null;                                //The bright color of this brick

    this.image = new Image;                                 //Baked image data for this stud

    this.isGrey = !args.color;                              //If this is a static grey stud

    this.zIndex =                                           //Z-sort vertically and then horizontally.
        this.gpos.x * 2 -                                   //2x multiplier for stud overlap
        this.gpos.y * 100                                   //Y-pos has priority over X-pos.
        + 1;                                                //Plus one for stud overlap

    this.isPressed = false;                                 //If we are pressing on this stud
    this.isSelected = false;                                //If this stud is selected
    this.isSnapped = false;                                 //If this stud is snapped to a position
    this.isVisible = true;                                  //If this stud is visible
}

BrickStud.prototype = 
Object.create(GameObject.prototype);
Object.assign(BrickStud.prototype, {

    //Initialize a game object after its scene is loaded.
    init : function(ctx, scenes) {
        
        //Initialize colors
        ctx.fillStyle = this.color;                                     //ctx fill style will be a hex color for good math

        this.colorDark = engine.math.colorMult(ctx.fillStyle, 0.625);   //Calculate dark color
        this.colorBright = engine.math.colorAdd(ctx.fillStyle, 48);     //Calculate bright color

        //Bake image of stud
        this.image.src = engine.baker.bake(                             //Set image src from baking results
            this,                                                       //Bake for this stud
            this.drawBrickStud,                                         //Draw stud for baked image
            engine.math.gmultx * 2,                                     //Width to contain both stud images
            engine.math.zDepth * 2,                                     //Height to contain both stud images
            "STUD." + this.color);                                      //Tag image as a stud with color
    },

    //Game object draw
    draw : function(ctx) {
        
        if(this.isVisible) {                                            //If this stud is visible

            //Global transparency for selection states
            ctx.globalAlpha =
            this.isSnapped ? 0.75 :                                     //Snapped studs are transparent
            this.isSelected ? 0.5 :                                     //Selected studs are more transparent
            this.isPressed ? 0.75 :                                     //Pressed studs are less transparent again
            1.0;                                                        //Otherwise opaque if not selected or pressed
            
            //Draw the stored image for this stud
            ctx.drawImage(this.image, engine.math.zDepth - 13.5, 0);    //Draw stud from image
        }
    },

    //Set this stud's snap state
    snap : function(state) {

        if(state) {                                                                 //If snap state

            this.isSnapped = true;                                                  //Set as snap
            this.zIndex =                                                           //Set z-index
               (this.gpos.x + Math.round(this.spos.x / engine.math.gmultx)) * 2 -   //2x multiplier for stud overlap
               (this.gpos.y + Math.round(this.spos.y / engine.math.gmulty)) * 100 + //Y-pos has priority over X-pos.
               1;                                                                   //Plus one for stud overlap
        }
        else {                                                                      //If unsnap state

            this.isSnapped = false;                                                 //Set as unsnapped
            this.zIndex = engine.math.underCursorZIndex;                            //Set Z-index for dragging
        }
    },

    //Setup this stud for pressing
    press : function() {
        this.isPressed = true;                          //The brick for this stud has been pressed
    },

    //Setup this stud for selecting
    select : function() {
        this.isSelected = true;                         //The brick for this stud has been selected
        this.zIndex = engine.math.underCursorZIndex;    //Set Z-index for the selected state
    },

    //Reset this stud's z-index
    deselect : function() {
        this.zIndex =               //Z-sort vertically and then horizontally.
            this.gpos.x * 2 -       //2x multiplier for stud overlap
            this.gpos.y * 100 +     //Y-pos has priority over X-pos.
            1;                      //Plus one for stud overlap
        this.isPressed = false;     //Depress brick :(
        this.isSelected = false;    //Deselect brick
        this.isSnapped = false;     //Unsnap brick
    },

    //Draw sequence for this stud.
    drawBrickStud : function(ctx) {

        //Offset for baked drawing.
        ctx.translate(12.5, engine.math.gmulty);        //Initial offset

        //Stud
        for(i = 1; i >= 0; i--) {                       //Draw 2 studs

            var off = i * engine.math.studHeight * 2;   //Individual stud offset

            //Stud column style
            var gradient = ctx.createLinearGradient(off - engine.math.studRadius, 0, off + engine.math.studRadius, 0);                      //Gradient for stud column
            gradient.addColorStop(0, this.color);                                                                                           //Gradient light shading
            gradient.addColorStop(1, this.colorDark);                                                                                       //Gradient dark shading
            ctx.fillStyle = gradient;                                                                                                       //Gradient fill

            //Stud column
            ctx.beginPath();                                                                                                                //Start column
            ctx.ellipse(off, -engine.math.studHeight     - off, engine.math.studRadius, engine.math.studRadius * 0.36, 0, 0, Math.PI);      //Bottom of column
            ctx.ellipse(off, -engine.math.studHeight * 2 - off, engine.math.studRadius, engine.math.studRadius * 0.36, 0, Math.PI, 0);      //Top of column
            ctx.fill();                                                                                                                     //Fill column

            //Stud top style
            ctx.fillStyle = this.colorBright;           //Bright color for top

            //Stud top
            ctx.beginPath();                                                                                                                //Start stud top
            ctx.ellipse(off, -engine.math.studHeight * 2 - off, engine.math.studRadius, engine.math.studRadius * 0.36, 0, 0, 2 * Math.PI);  //Stud top
            ctx.fill();                                                                                                                     //Fill stud top

            //Draw holes in studs if they are grey
            if(this.isGrey) {                           //If this is a grey brick, it needs a hole

                //Stud grey hole style
                ctx.fillStyle = this.color;             //Use neutral color for hole

                //Stud grey hole
                ctx.beginPath();                                                                                                            //Start hole
                ctx.ellipse(off, -engine.math.studHeight * 2 - off, engine.math.studRadius * 0.6, engine.math.studRadius * 0.216, 0, 0, 2 * Math.PI);   //Hole
                ctx.fill();                                                                                                                 //Fill hole
            }
        }
    }
});