//Level UI Game Object
var UILevel = function(args) { GameObject.call(this, args);

    this.color = engine.math.colorTranslate();                  //The UI rect color
    this.colorDark = null;                                      //The UI rect shaded color
    this.colorBright = null;                                    //The UI rect light color

    this.colorCeiling = engine.math.colorTranslate('black');    //The ceiling rect color
    this.colorCeilingDark = null;                               //The ceiling rect shaded color
    this.colorCeilingBright = null;                             //The ceiling rect light color

    this.logoColor = '#747474'                                  //The logo color

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

    //Draw the level UI background
    drawBackground : function(ctx) {

        //Draw sidebar
        ctx.save();
        this.drawSidebar(ctx);
        ctx.restore();

        //Draw ceiling
        ctx.save();
        this.drawCeiling(ctx);
        ctx.restore();

        //Draw logo
        ctx.save();
        this.drawLogo(ctx);
        ctx.restore();
    },

    //Draw the sidebar menu
    drawSidebar : function(ctx) {

        //Main UI color
        ctx.fillStyle = this.color;

        //UI side rect
        ctx.beginPath();
        ctx.fillRect(
                                engine.math.gmultx * (engine.math.boundary.maxx) + engine.math.zDepth / 2,  //xpos
                                engine.math.gmulty,                                                         //ypos
            ctx.canvas.width -  engine.math.gmultx * (engine.math.boundary.maxx),                           //width
            ctx.canvas.height - engine.math.gmulty);                                                        //height

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
    },

    //Draw the universal ceiling
    drawCeiling : function(ctx) {

        //Reset transform to draw from the top-left corner
        var ceilOffsetU = engine.math.gmulty / 3 * 4;                   //Upper edge of ceiling
        var ceilOffsetL = engine.math.gmulty / 3 * 5;                   //Lower edge of ceiling
        var ceilOffsetB = ceilOffsetU - engine.math.zDepth;             //Back edge of ceiling

        //Ceiling front face color
        ctx.fillStyle = this.colorCeiling;

        //Ceiling front face
        ctx.fillRect(
            0,                                                          //xpos
            ceilOffsetU,                                                //ypos
            ctx.canvas.width,                                           //width
            ceilOffsetL - ceilOffsetU);                                 //height

        //Ceiling top face color
        ctx.fillStyle = this.colorCeilingBright;

        //Ceiling top face
        ctx.beginPath();
        ctx.moveTo(0,                  ceilOffsetU);                    //Lower left
        ctx.lineTo(engine.math.zDepth, ceilOffsetB);                    //Upper left
        ctx.lineTo(ctx.canvas.width,   ceilOffsetB);                    //Upper right
        ctx.lineTo(ctx.canvas.width,   ceilOffsetU);                    //Lower right
        ctx.fill();

        //Ceiling bottom line color
        ctx.strokeStyle = this.colorCeilingDark;

        //Ceiling bottom line
        ctx.beginPath();
        ctx.moveTo(0,                ceilOffsetL);                      //Left side
        ctx.lineTo(ctx.canvas.width, ceilOffsetL);                      //Right side
        ctx.stroke();

        //Draw ceiling lines across the
        for(var i = engine.math.lineWidth / 2; i < ctx.canvas.width;) { //Going across the canvas width

            //Top line color
            ctx.strokeStyle = this.colorCeiling;

            //Top line
            ctx.beginPath();
            ctx.moveTo(i + engine.math.zDepth - engine.math.lineWidth, ceilOffsetB + engine.math.lineWidth);   //Top line upper
            ctx.lineTo(i,                                              ceilOffsetU);                           //Top line lower
            ctx.stroke();   

            //Front line color  
            ctx.strokeStyle = this.colorCeilingDark;    

            //Front line    
            ctx.beginPath();    
            ctx.moveTo(i, ceilOffsetU + engine.math.lineWidth / 2);     //Front line upper
            ctx.lineTo(i, ceilOffsetL);                                 //Front line lower
            ctx.stroke();   

            i += 4 * engine.math.gmultx;                                //Increment for set of lines
        }

        //Upper UI rect fill and border colors
        ctx.strokeStyle = this.colorCeiling;
 
        //Upper UI rect
        ctx.beginPath();
        ctx.moveTo(engine.math.zDepth, ceilOffsetB + engine.math.lineWidth / 2);    //Left side
        ctx.lineTo(ctx.canvas.width,   ceilOffsetB + engine.math.lineWidth / 2);    //Right side
        ctx.stroke();
    },

    //Draw the recyle logo on the sidebar
    drawLogo : function(ctx) {

        //Translate to logo center
        ctx.translate(        
            ctx.canvas.width / 2 +
            engine.math.boundary.maxx * engine.math.gmultx / 2 +
            engine.math.zDepth / 4,
            175);

        //Draw 4 arrows of logo
        for(var i = 0; i < 4; i++) {

            //Logo color
            ctx.fillStyle = this.logoColor;

            var logoStart = 10; //Starting point of the logo arrow
            var logoWidth = 64; //Width of the logo
            var logoThick = 17; //Thickness of the logo arrows
            var logoPoint = 28; //Depth of the logo arrow points

            //Draw logo arrow
            ctx.beginPath();
            ctx.moveTo(logoStart,             logoWidth - logoThick);   //Bruh do you think SVG would have been better for all of this?
            ctx.lineTo(logoWidth - logoThick, logoWidth - logoThick);   
            ctx.lineTo(logoWidth - logoThick, logoPoint);
            ctx.lineTo(logoWidth / 2,         logoPoint);
            ctx.lineTo(logoWidth,            -logoStart / 2);
            ctx.lineTo(logoWidth / 2 * 3,     logoPoint);
            ctx.lineTo(logoWidth + logoThick, logoPoint);
            ctx.lineTo(logoWidth + logoThick, logoWidth + logoThick);   //Nah
            ctx.lineTo(logoStart,             logoWidth + logoThick);
            ctx.fill();

            //Rotate 90 degrees for the next arrow
            ctx.rotate(Math.PI / 2);
        }
    }
});