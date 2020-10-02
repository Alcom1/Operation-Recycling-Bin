//Level UI Game Object
var UILevel = function(args) { GameObject.call(this, args);

    this.color = engine.math.colorTranslate('grey');    //The UI rect color
    this.colorDark = null;                              //The UI rect shaded color

}

//Level UI Prototype
UILevel.prototype = 
Object.create(GameObject.prototype);
Object.assign(UILevel.prototype, {

    //Initialize a game object after its scene is loaded.
    init : function(ctx, scenes) {

        //Initialize colors
        ctx.fillStyle = this.color;                                     //ctx fill style will be a hex color for good math
        this.colorDark = engine.math.colorMult(ctx.fillStyle, 0.625);   //Calculate dark color
    },

    //Game object draw
    draw : function(ctx) {

        ctx.fillStyle = this.color;             //Fill style

        //UI rect Border style
        ctx.strokeStyle = this.colorDark;       //Stroke dark color
        ctx.lineWidth = engine.math.lineWidth;  //Line width
        ctx.lineCap = "square";                 //Square corners

        //UI rect
        ctx.beginPath();                        //Begin background rect
        ctx.rect(
                               engine.math.gmultx * engine.math.boundary.maxx + engine.math.lineWidth / 2 + engine.math.zDepth / 2,     //xpos
                               0                                              + engine.math.lineWidth / 2,                              //ypos
            ctx.canvas.width - engine.math.gmultx * engine.math.boundary.maxx - engine.math.lineWidth / 2,                              //width
                               engine.math.gmulty * engine.math.boundary.maxy - engine.math.lineWidth     - engine.math.zDepth / 2);    //height

        ctx.fill();                             //Fill background rect
        ctx.stroke();                           //Stroke background rect
    }
});