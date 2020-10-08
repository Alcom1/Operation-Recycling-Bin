//FPS counter game object
var Button = function(args) { GameObject.call(this, args);

    this.states = Object.freeze({   //Button states
        NONE : 0,                   //None state
        HOVER : 1,                  //Hover state
        PRESS : 2                   //Press state
    });

    this.state = this.states.NONE;  //Default button state

    this.size = new Vect(           //Button size
        args.size.x,                //Button width
        args.size.y);               //Button height

    this.bgColor = engine.math.colorTranslate(args.backgroundColor);    //Button color
    this.bgColorDark = null;                                            //Button shaded color
    this.bgColorBright = null;                                          //Button light color

    this.bhColor = engine.math.colorTranslate(args.hoverColor);         //Button hover color
    this.bhColorDark = null;                                            //Button hover shaded color
    this.bhColorBright = null;                                          //Button hover light color

    this.font = args.font || "bold 18pt Consolas";                      //Font and default font
    this.color = args.color || "white";                                 //Color and default color

    this.text = args.text;                                              //Button text

    //Fix button position
    this.spos.set(
        this.gpos.x * engine.math.gmultx,   //Convert x gpos to spos
        this.gpos.y * engine.math.gmulty);  //Convert y gpos to spos
    this.gpos.set(0, 0);                    //Remove gpos
}

//FPS counter prototype
Button.prototype = 
Object.create(GameObject.prototype);
Object.assign(Button.prototype, {

    //Initialize a game object after its scene is loaded.
    init : function(ctx, scenes) {

        //Initialize colors
        ctx.fillStyle = this.bgColor;   //Color

        this.bgColorDark = engine.math.colorMult(ctx.fillStyle, 0.625); //Calculate dark color
        this.bgColorBright = engine.math.colorAdd(ctx.fillStyle, 48);   //Calculate bright color

        ctx.fillStyle = this.bhColor;   //Color

        this.bhColorDark = engine.math.colorMult(ctx.fillStyle, 0.625); //Calculate dark color
        this.bhColorBright = engine.math.colorAdd(ctx.fillStyle, 48);   //Calculate bright color
    },

    //Game object update
    update : function(dt) {
        
        var pos = engine.mouse.getPos();

        //If the cursor is over the button
        if (engine.math.colPointRect(       //Check collision between cursor and button
            pos.x,                          //Cursor x-pos
            pos.y,                          //Cursor y-pos
            this.spos.x - this.size.x / 2,  //Button x-corner
            this.spos.y - this.size.y / 2,  //Button y-corner
            this.size.x,                    //Button width
            this.size.y                     //Button height
        )) {
            
            this.state = this.states.HOVER; //Switch to hover state

            //If the mouse was released over this button, do this button's action
            if(engine.mouse.getMouseState() == engine.mouse.mouseStates.WASRELEASED) {

                this.doButtonAction();      //Do this button's action
            }
        }
        else {                              //If the cursor is not over the button

            this.state = this.states.NONE;  //Switch to none state
        }
    },

    doButtonAction : function() {

        console.log(this.text);
    },

    //Game object draw
    draw : function(ctx) {
        
        //Button rectangle color
        ctx.fillStyle = this.state == this.states.HOVER ?   //If this is a hover state
            this.bhColor :                                  //Hover color
            this.bgColor;                                   //Background color

        //Draw button rectangle
        ctx.fillRect(
           -this.size.x / 2,            //Center vertical
           -this.size.y / 2,            //Center horizontal
            this.size.x,                //Button width
            this.size.y);               //Button height

        //Draw button text
        ctx.textBaseline = "middle";    //Center vertical
        ctx.textAlign = "center";       //Center horizontal
        ctx.font = this.font;           //Font
        ctx.fillStyle = this.color;     //Color
        ctx.fillText(this.text, 1, 1);  //Fill FPS counter text
    }
});