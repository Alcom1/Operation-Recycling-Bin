//Series of studs for a brick
var BrickStud = function(args) { GameObject.call(this, args);

    this.color = engine.math.colorTranslate(args.color);    //The color of this stud
    this.colorDark = null;
    this.colorBright = null;

    this.image = null;                                      //Baked image data for this stud

    this.isGrey = !args.color;          //If this is a static grey stud

    this.zIndex = this.gpos.x * 2 - this.gpos.y * 100 + 1;  //Z-sort vertically and then horizontally.

    this.isPressed = false;             //If we are pressing on this stud
    this.isSelected = false;            //If this stud is selected
}

BrickStud.prototype = 
Object.create(GameObject.prototype);
Object.assign(BrickStud.prototype, {

    //Initialize a game object after its scene is loaded.
    init : function(ctx) {
        
        //Initialize colors
        ctx.fillStyle = this.color;

        this.colorDark = engine.math.colorMult(ctx.fillStyle, 0.625);
        this.colorBright = engine.math.colorAdd(ctx.fillStyle, 48);

        //Bake image of stud
        this.image = new Image;
        this.image.src = engine.baker.bake(
            this, 
            this.drawBrickStud, 
            engine.math.gmultx * 2,
            engine.math.zDepth * 2,
            "STUD." + this.color);
    },

    //Game object draw
    draw : function(ctx) {
        
        //Global transparency for selection states
        ctx.globalAlpha =
            this.isPressed ? 0.8 :
            this.isSelected ? 0.3 :
            1.0;
        
        //Draw the stored image for this stud
        ctx.drawImage(this.image, engine.math.zDepth - 11.5, 0);
    },

    //Setup this stud for pressing
    press : function() {
        this.isPressed = true;
    },

    //Setup this stud for selecting
    select : function() {
        this.isSelected = true;
        this.zIndex = engine.math.underCursorZIndex;
    },

    //Reset this stud's z-index
    deselect : function() {
        this.zIndex = this.gpos.x * 2 - this.gpos.y * 100 + 1;  //Set z-index
        this.isPressed = false; 
        this.isSelected = false;
    },

    //Draw sequence for this stud.
    drawBrickStud : function(ctx) {

        //Offset for baked drawing.
        ctx.translate(12.5, engine.math.gmulty);

        //Stud
        for(i = 1; i >= 0; i--) {

            var off = i * engine.math.studHeight * 2;

            //Stud column style
            var gradient = ctx.createLinearGradient(off - engine.math.studRadius, 0, off + engine.math.studRadius, 0);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, this.colorDark);
            ctx.fillStyle = gradient;

            //Stud column
            ctx.beginPath();
            ctx.ellipse(off, -engine.math.studHeight     - off, engine.math.studRadius, engine.math.studRadius * 0.36, 0, 0, Math.PI);
            ctx.ellipse(off, -engine.math.studHeight * 2 - off, engine.math.studRadius, engine.math.studRadius * 0.36, 0, Math.PI, 0);
            ctx.fill();

            //Stud top style
            ctx.fillStyle = this.colorBright;

            //Stud top
            ctx.beginPath();
            ctx.ellipse(off, -engine.math.studHeight * 2 - off, engine.math.studRadius, engine.math.studRadius * 0.36, 0, 0, 2 * Math.PI);
            ctx.fill();

            //Draw holes in studs if they are grey
            if(this.isGrey) {

                //Stud grey hole style
                ctx.fillStyle = this.color;

                //Stud grey hole
                ctx.beginPath();
                ctx.ellipse(off, -engine.math.studHeight * 2 - off, engine.math.studRadius * 0.6, engine.math.studRadius * 0.216, 0, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    }
});