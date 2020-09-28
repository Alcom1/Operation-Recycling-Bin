//Background object
var Background = function(args) { GameObject.call(this, args);

    this.color = engine.math.colorTranslate('grey');    //The color of the background bricks
    this.colorDark = null;                              //The shaded color of the background bricks

    this.image = new Image;                             //Baked image data for this background
}

//Background prototype
Background.prototype = 
Object.create(GameObject.prototype);
Object.assign(Background.prototype, {

    //Initialize a game object after its scene is loaded.
    init : function(ctx, scenes) {

        //Initialize colors
        ctx.fillStyle = this.color;                                     //ctx fill style will be a hex color for good math
        this.colorDark = engine.math.colorMult(ctx.fillStyle, 0.625);   //Calculate dark color

        //Bake image of brick
        this.image.src = engine.baker.bake(                             //Set image src from baking results
            this,                                                       //Bake for this background
            this.drawBackground);                                       //Draw background for baked image
    },

    //Game object draw
    draw : function(ctx) {

        ctx.drawImage(this.image, 0, 0);    //Draw background image
    },

    //Game object draw
    drawBackground : function(ctx) {

        //Right face style
        ctx.fillStyle = this.colorDark;                                                 //Fill dark color

        //Iteratively draw right sides for the left side wall.
        for(var i = 0; i < 23; i++) {                                                   //For each background left-side brick

            //Right face
            ctx.beginPath();                                                            //Start path
            ctx.moveTo(0,                   engine.math.gmulty);                        //Lower left corner
            ctx.lineTo(0,                   0);                                         //Upper left corner
            ctx.lineTo(engine.math.zDepth,                     - engine.math.zDepth);   //Upper right corner
            ctx.lineTo(engine.math.zDepth,  engine.math.gmulty - engine.math.zDepth);   //Lower right corner
            ctx.fill();                                                                 //Fill right face

            ctx.translate(0, engine.math.gmulty);                                       //Translate downward for each iteration
        }
    }
});