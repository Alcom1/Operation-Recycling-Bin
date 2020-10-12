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

        ctx.fillStyle = this.color;             //Fill style

        //UI side rect
        ctx.beginPath();                        //Begin background rect
        ctx.fillRect(
                               engine.math.gmultx * engine.math.boundary.maxx + engine.math.zDepth / 2,     //xpos
                               0                                                                      ,     //ypos
            ctx.canvas.width - engine.math.gmultx * engine.math.boundary.maxx                         ,     //width
                               engine.math.gmulty * engine.math.boundary.maxy - engine.math.zDepth / 2);    //height
                               
        ctx.fillStyle = this.color;             //Fill style

        //UI top rect
        ctx.fillRect(
                                                                                engine.math.zDepth / 2,     //xpos
                               0,                                                                           //ypos
                               engine.math.gmultx * engine.math.boundary.maxx,                              //width                     
                               engine.math.gmulty                             - engine.math.zDepth / 2);    //height

        //Translate for lower brick
        ctx.translate(
            engine.math.gmultx * engine.math.boundary.maxx,             //Translate-x
            engine.math.gmulty * (engine.math.boundary.maxy - 1));      //Translate-y

        ctx.fillRect(                           //Rectangle for front face
            0,                                  //Origin
            0,                                  //Origin
            engine.math.gmultx * 9,             //Brick width
            engine.math.gmulty);                //Brick height

        
        //Top face style
        ctx.fillStyle = this.colorBright;       //Fill bright color

        //Top face
        ctx.beginPath();                                                //Start path    
        ctx.moveTo(0,                       0);                         //Lower left corner
        ctx.lineTo(engine.math.zDepth / 2,  -engine.math.zDepth / 2);   //Upper left corner
        ctx.lineTo(ctx.canvas.width,        -engine.math.zDepth);       //Upper right corner
        ctx.lineTo(ctx.canvas.width,        0);                         //Lower right corner
        ctx.fill();      

        //UI Border style
        ctx.strokeStyle = this.colorBright;     //Stroke dark color
        ctx.lineWidth = engine.math.lineWidth;  //Line width
        ctx.lineCap = "square";                 //Square corners   

        //Light plate border    
        ctx.strokeStyle = this.colorBright;     //Stroke bright color   
        ctx.beginPath();    
        ctx.moveTo(engine.math.lineWidth * 1.5, engine.math.gmulty / 3);                                //Border start
        ctx.lineTo(ctx.canvas.width,            engine.math.gmulty / 3);                                //Border end
        ctx.stroke();   
            
        //Dark plate border 
        ctx.strokeStyle = this.colorDark;       //Stroke dark color 
        ctx.beginPath();    
        ctx.moveTo(engine.math.lineWidth,       engine.math.gmulty / 3 - engine.math.lineWidth / 2);    //Left pseudo-pixel
        ctx.lineTo(engine.math.lineWidth * 1.5, engine.math.gmulty / 3 - engine.math.lineWidth);        //Border start
        ctx.lineTo(ctx.canvas.width,            engine.math.gmulty / 3 - engine.math.lineWidth);        //Border end
        ctx.stroke();

        //Border
        ctx.beginPath();
        ctx.moveTo(                             -engine.math.gmultx * (engine.math.boundary.maxx)     + engine.math.zDepth / 2,
                                                -engine.math.gmulty * (engine.math.boundary.maxy - 1) - engine.math.zDepth / 2);    //Upper left corner top
        ctx.lineTo(                             -engine.math.gmultx * (engine.math.boundary.maxx)     + engine.math.zDepth / 2,
                                                -engine.math.gmulty * (engine.math.boundary.maxy - 2) - engine.math.zDepth / 2);    //Upper left corner far
        ctx.lineTo(engine.math.zDepth    / 2,   -engine.math.gmulty * (engine.math.boundary.maxy - 2) - engine.math.zDepth / 2);    //Upper right border far
        ctx.lineTo(engine.math.zDepth    / 2,                                                         - engine.math.zDepth / 2);    //Upper left corner (back)                                                                                //Start path
        ctx.lineTo(engine.math.lineWidth / 2,   0);                                                                                 //Upper left corner
        ctx.lineTo(engine.math.lineWidth / 2,   engine.math.gmulty                                    - engine.math.lineWidth / 2); //Lower left corner
        ctx.lineTo(ctx.canvas.width,            engine.math.gmulty                                    - engine.math.lineWidth / 2); //Lower right corner
        ctx.stroke();

        //Depth Border
        ctx.strokeStyle = this.color;           //Stroke color
        ctx.beginPath(); 
        ctx.moveTo(engine.math.zDepth    / 2,   -engine.math.zDepth / 2);   //Upper left corner (back)
        ctx.lineTo(engine.math.lineWidth / 2,   0);                         //Upper left corner
        ctx.stroke();

        //
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        var topWidth = engine.math.gmultx * engine.math.boundary.maxx + engine.math.zDepth / 2;

        //
        ctx.fillStyle = this.colorCeiling;

        //
        ctx.fillRect(
            0,
            engine.math.gmulty / 3 * 4,
            ctx.canvas.width,
            engine.math.gmulty / 3);

        //
        ctx.fillStyle = this.colorCeilingBright;

        //
        ctx.fillRect(
                               topWidth - engine.math.lineWidth / 2,
            engine.math.gmulty / 3 * 4  - engine.math.zDepth / 2,
            ctx.canvas.width - topWidth + engine.math.lineWidth / 2,
                                          engine.math.zDepth / 2);

        //
        ctx.beginPath();
        ctx.moveTo(0,                                    engine.math.gmulty / 3 * 4);
        ctx.lineTo(           engine.math.zDepth,        engine.math.gmulty / 3 * 4 - engine.math.zDepth);
        ctx.lineTo(topWidth - engine.math.lineWidth / 2, engine.math.gmulty / 3 * 4 - engine.math.zDepth);
        ctx.lineTo(topWidth - engine.math.lineWidth / 2, engine.math.gmulty / 3 * 4);
        ctx.fill();

        //
        ctx.strokeStyle = this.colorCeilingDark;

        //            
        ctx.beginPath();
        ctx.moveTo(0,                engine.math.gmulty / 3 * 5);
        ctx.lineTo(ctx.canvas.width, engine.math.gmulty / 3 * 5);
        ctx.stroke();

        //
        for(var i = -engine.math.lineWidth * 2; i < ctx.canvas.width;) {

            //
            ctx.strokeStyle = this.colorCeiling;

            //
            ctx.beginPath();

            //
            if(i < engine.math.boundary.maxx * engine.math.gmultx) {

                ctx.moveTo(i,                                           engine.math.gmulty - engine.math.zDepth / 2);
            }
            else {

                ctx.moveTo(i + engine.math.zDepth - engine.math.gmulty, engine.math.gmulty);
            }

            ctx.lineTo(i + engine.math.zDepth - engine.math.gmulty / 3 * 4, engine.math.gmulty / 3 * 4);
            ctx.stroke();

            //
            ctx.strokeStyle = this.colorCeilingDark;

            //
            ctx.beginPath();
            ctx.moveTo(i + engine.math.zDepth - engine.math.gmulty / 3 * 4, engine.math.gmulty / 3 * 4);
            ctx.lineTo(i + engine.math.zDepth - engine.math.gmulty / 3 * 4, engine.math.gmulty / 3 * 5);
            ctx.stroke();

            i += 4 * engine.math.gmultx;
        }

        //
        ctx.strokeStyle = this.colorDark;

        //            
        ctx.beginPath();
        ctx.moveTo(engine.math.boundary.maxx * engine.math.gmultx + engine.math.zDepth / 2, engine.math.gmulty);
        ctx.lineTo(ctx.canvas.width,                                                        engine.math.gmulty);
        ctx.stroke();
    }
});