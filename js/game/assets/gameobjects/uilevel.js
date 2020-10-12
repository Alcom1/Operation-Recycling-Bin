//Level UI Game Object
var UILevel = function(args) { GameObject.call(this, args);

    this.color = engine.math.colorTranslate();              //The UI rect color
    this.colorDark = null;                                  //The UI rect shaded color
    this.colorBright = null;                                //The UI rect light color

    this.colorCeiling = engine.math.colorTranslate('#334'); //The ceiling rect color
    this.colorCeilingDark = null;                           //The ceiling rect shaded color
    this.colorCeilingBright = null;                         //The ceiling rect light color

    this.image = new Image;                     //Baked image data for this background
}

//Level UI Prototype
UILevel.prototype =
Object.create(GameObject.prototype);
Object.assign(UILevel.prototype, {

    //Initialize a game object after its scene is loaded.
    init : function(ctx, scenes) {

        //Initialize colors
        ctx.fillStyle = this.color;                                             //Store color in canvas for hex conversion
        this.colorDark = engine.math.colorMult(ctx.fillStyle, 0.625);           //Calculate dark color
        this.colorBright = engine.math.colorAdd(ctx.fillStyle, 48);             //Calculate bright color

        ctx.fillStyle = this.colorCeiling;                                      //Store ceiling color in canvas for hex conversion
        this.colorCeilingDark = engine.math.colorMult(ctx.fillStyle, 0.625);    //Calculate dark ceiling color
        this.colorCeilingBright = engine.math.colorAdd(ctx.fillStyle, 48);      //Calculate bright ceiling color

        //Bake image of brick
        this.image.src = engine.baker.bake(                                     //Set image src from baking results
            this,                                                               //Bake for this background
            this.drawBackground);                                               //Draw background for baked image
    },

    //Game object draw
    draw : function(ctx) {

        ctx.drawImage(this.image, 0, 0);    //Draw background image
    },

    //Draw the UI level background
    drawBackground : function(ctx) {

        //Main UI color
        ctx.fillStyle = this.color;

        //UI side rect
        ctx.beginPath();
        ctx.fillRect(
                               engine.math.gmultx * engine.math.boundary.maxx + engine.math.zDepth / 2,     //xpos
                               0                                                                      ,     //ypos
            ctx.canvas.width - engine.math.gmultx * engine.math.boundary.maxx                         ,     //width
                               engine.math.gmulty * engine.math.boundary.maxy - engine.math.zDepth / 2);    //height

        //Translate for lower brick
        ctx.translate(
            engine.math.gmultx * engine.math.boundary.maxx,                 //Translate-x
            engine.math.gmulty * (engine.math.boundary.maxy - 1));          //Translate-y

        //Lower brick front face
        ctx.fillRect(                                                       //Rectangle for front face
            0,                                                              //Origin
            0,                                                              //Origin
            engine.math.gmultx * 9,                                         //Brick width
            engine.math.gmulty);                                            //Brick height

        //Top face style
        ctx.fillStyle = this.colorBright;

        //Top face
        ctx.beginPath();
        ctx.moveTo(0,                       0);                             //Lower left corner
        ctx.lineTo(engine.math.zDepth / 2,  -engine.math.zDepth / 2);       //Upper left corner
        ctx.lineTo(ctx.canvas.width,        -engine.math.zDepth);           //Upper right corner
        ctx.lineTo(ctx.canvas.width,        0);                             //Lower right corner
        ctx.fill(); 

        //UI Border style   
        ctx.strokeStyle = this.colorBright;                                 //Stroke dark color
        ctx.lineWidth = engine.math.lineWidth;                              //Line width
        ctx.lineCap = "square";                                             //Square corners

        //Light plate border color
        ctx.strokeStyle = this.colorBright;

        //Light plate border
        ctx.beginPath();
        ctx.moveTo(engine.math.lineWidth * 1.5, engine.math.gmulty / 3);    //Border start
        ctx.lineTo(ctx.canvas.width,            engine.math.gmulty / 3);    //Border end
        ctx.stroke();

        //Dark plate border color
        ctx.strokeStyle = this.colorDark;

        //Dark plate border
        ctx.beginPath();
        ctx.moveTo(engine.math.lineWidth,       engine.math.gmulty / 3 - engine.math.lineWidth / 2);    //Left pseudo-pixel
        ctx.lineTo(engine.math.lineWidth * 1.5, engine.math.gmulty / 3 - engine.math.lineWidth);        //Border start
        ctx.lineTo(ctx.canvas.width,            engine.math.gmulty / 3 - engine.math.lineWidth);        //Border end
        ctx.stroke();

        //Border
        ctx.beginPath();
        ctx.moveTo(engine.math.zDepth    / 2,   -engine.math.gmulty * (engine.math.boundary.maxy - 3) - engine.math.zDepth / 2);    //Upper right border far
        ctx.lineTo(engine.math.zDepth    / 2,                                                         - engine.math.zDepth / 2);    //Upper left corner (back)                                                                                //Start path
        ctx.lineTo(engine.math.lineWidth / 2,   0);                                                                                 //Upper left corner
        ctx.lineTo(engine.math.lineWidth / 2,   engine.math.gmulty                                    - engine.math.lineWidth / 2); //Lower left corner
        ctx.lineTo(ctx.canvas.width,            engine.math.gmulty                                    - engine.math.lineWidth / 2); //Lower right corner
        ctx.stroke();

        //Depth Border color
        ctx.strokeStyle = this.color;

        //Depth Border
        ctx.beginPath();
        ctx.moveTo(engine.math.zDepth    / 2,   -engine.math.zDepth / 2);   //Upper left corner (back)
        ctx.lineTo(engine.math.lineWidth / 2,   0);                         //Upper left corner
        ctx.stroke();

        //Reset transform to draw from the top-left corner
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        //Ceiling front face color
        ctx.fillStyle = this.colorCeiling;

        //Ceiling front face
        ctx.fillRect(
            0,                                                              //xpos
            engine.math.gmulty / 3 * 4,                                     //ypos
            ctx.canvas.width,                                               //width
            engine.math.gmulty / 3);                                        //height

        //Ceiling top face color
        ctx.fillStyle = this.colorCeilingBright;

        //Ceiling top face
        ctx.beginPath();
        ctx.moveTo(0,                      engine.math.gmulty / 3 * 4);                             //Lower left
        ctx.lineTo(engine.math.zDepth / 2, engine.math.gmulty / 3 * 4 - engine.math.zDepth / 2);    //Upper left
        ctx.lineTo(ctx.canvas.width,       engine.math.gmulty / 3 * 4 - engine.math.zDepth / 2);    //Upper right
        ctx.lineTo(ctx.canvas.width,       engine.math.gmulty / 3 * 4);                             //Lower right
        ctx.fill();

        //Ceiling bottom line color
        ctx.strokeStyle = this.colorCeilingDark;

        //Ceiling bottom line
        ctx.beginPath();
        ctx.moveTo(0,                engine.math.gmulty / 3 * 5);           //Left side
        ctx.lineTo(ctx.canvas.width, engine.math.gmulty / 3 * 5);           //Right side
        ctx.stroke();

        //Draw ceiling lines across the
        for(var i = engine.math.lineWidth / 2; i < ctx.canvas.width;) {     //Going across the canvas width

            //Top line color
            ctx.strokeStyle = this.colorCeiling;

            //Top line
            ctx.beginPath();
            ctx.moveTo(i + engine.math.zDepth / 2, engine.math.gmulty);     //Top line upper
            ctx.lineTo(i, engine.math.gmulty + engine.math.zDepth / 2);     //Top line lower
            ctx.stroke();   

            //Front line color  
            ctx.strokeStyle = this.colorCeilingDark;    

            //Front line    
            ctx.beginPath();    
            ctx.moveTo(i, engine.math.gmulty / 3 * 4);                      //Front line upper
            ctx.lineTo(i, engine.math.gmulty / 3 * 5);                      //Front line lower
            ctx.stroke();   

            i += 4 * engine.math.gmultx;                                    //Increment for set of lines
        }

        //Upper UI rect fill and border colors
        ctx.fillStyle =   this.color;
        ctx.strokeStyle = this.colorDark;

        //Upper UI rect
        ctx.beginPath();
        ctx.rect(
            engine.math.lineWidth / 2 + engine.math.zDepth / 2 ,            //xpos
          - engine.math.lineWidth / 2,                                      //ypos
            ctx.canvas.width          - engine.math.zDepth / 2,             //width
            engine.math.lineWidth / 2 + engine.math.gmulty);                //height
        ctx.fill();
        ctx.stroke();
    }
});