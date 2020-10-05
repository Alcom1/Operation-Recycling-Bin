//Level UI Game Object
var UILevel = function(args) { GameObject.call(this, args);

    this.color = engine.math.colorTranslate(null);  //The UI rect color
    this.colorDark = null;                          //The UI rect shaded color
    this.colorBright = null;                        //The UI rect light color

    this.image = new Image;                         //Baked image data for this background
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
        this.colorBright = engine.math.colorAdd(ctx.fillStyle, 48);     //Calculate bright color

        //Bake image of brick
        this.image.src = engine.baker.bake(                             //Set image src from baking results
            this,                                                       //Bake for this background
            this.drawBackground);                                       //Draw background for baked image
    },

    //Game object draw
    draw : function(ctx) {

        ctx.drawImage(this.image, 0, 0);    //Draw background image
    },

    //Draw the UI level background
    drawBackground : function(ctx) {

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

        //Translate for lower brick
        ctx.translate(
            engine.math.gmultx * engine.math.boundary.maxx,
            engine.math.gmulty * (engine.math.boundary.maxy - 1));

        ctx.fillRect(               //Rectangle for front face
            0,                      //Origin
            0,                      //Origin
            engine.math.gmultx * 9, //Brick width
            engine.math.gmulty);    //Brick height

        
        //Top face style
        ctx.fillStyle = this.colorBright;   //Fill bright color

        //Top face
        ctx.beginPath();                                                //Start path    
        ctx.moveTo(0,                       0);                         //Lower left corner
        ctx.lineTo(engine.math.zDepth / 2,  -engine.math.zDepth / 2);   //Upper left corner
        ctx.lineTo(ctx.canvas.width,        -engine.math.zDepth);       //Upper right corner
        ctx.lineTo(ctx.canvas.width,        0);                         //Lower right corner
        ctx.fill();      

        //Depth Border
        ctx.beginPath(); 
        ctx.moveTo(engine.math.zDepth    / 2,   -engine.math.zDepth / 2);   //Upper left corner (back)
        ctx.lineTo(engine.math.lineWidth / 2,   0);                         //Upper left corner
        ctx.stroke();

        //Border style
        ctx.strokeStyle = this.colorDark;   //Stroke dark color

        //Border
        ctx.beginPath();                                                                            //Start path
        ctx.moveTo(engine.math.lineWidth / 2,   engine.math.lineWidth / 2);                         //Upper left corner
        ctx.lineTo(engine.math.lineWidth / 2,   engine.math.gmulty - engine.math.lineWidth / 2);    //Lower left corner
        ctx.lineTo(ctx.canvas.width,            engine.math.gmulty - engine.math.lineWidth / 2);    //Lower right corner
        ctx.stroke();
        
        //Dark plate border
        ctx.beginPath();
        ctx.moveTo(engine.math.lineWidth * 1.5, engine.math.gmulty / 3);                            //Border start
        ctx.lineTo(ctx.canvas.width,            engine.math.gmulty / 3);                            //Border end
        ctx.stroke();

        //Light plate border
        ctx.strokeStyle = this.colorBright; //Stroke bright color
        ctx.beginPath();
        ctx.moveTo(engine.math.lineWidth * 1.5, engine.math.gmulty / 3 + engine.math.lineWidth);    //Border start
        ctx.lineTo(ctx.canvas.width,            engine.math.gmulty / 3 + engine.math.lineWidth);    //Border end
        ctx.stroke();
    }
});