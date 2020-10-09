//FPS counter game object
var Button = function(args) { GameObject.call(this, args);

    this.states = Object.freeze({           //Button states
        NONE : 0,                           //None state
        PRESS : 2                           //Press state
    });

    this.state = this.states.NONE;          //Default button state

    this.hover = false;                     //If cursor is hovering over this button

    this.size = new Vect(                   //Button size
        args.size.x,                        //Button width
        args.size.y);                       //Button height

    this.bgColor = engine.math.colorTranslate(args.backgroundColor || "#DDD");  //Button color
    this.bgColorDark = null;                                                    //Button shaded color
    this.bgColorBright = null;                                                  //Button light color

    this.bhColor = engine.math.colorTranslate(args.hoverColor || "#DD0");       //Button hover color
    this.bhColorDark = null;                                                    //Button hover shaded color
    this.bhColorBright = null;                                                  //Button hover light color

    this.font = args.font || "bold 18pt Consolas";                              //Font and default font
    this.color = args.color || "#333";                                          //Color and default color

    this.text = args.text;                  //Button text
    this.isCenterUI = args.isCenterUI;      //If this button is horizontally centered around the UI
}

//FPS counter prototype
Button.prototype = 
Object.create(GameObject.prototype);
Object.assign(Button.prototype, {

    //Initialize a game object after its scene is loaded.
    init : function(ctx, scenes) {

        //Center button horizontally around the UI
        if (this.isCenterUI) {                                          //If the button is UI-horizontally centered                             
            this.spos.x =                                               //Horizontally center button around UI
                ctx.canvas.width / 2 +
                engine.math.boundary.maxx * engine.math.gmultx / 2 +
                engine.math.zDepth / 16;
        }

        //Initialize colors
        ctx.fillStyle = this.bgColor;   //Color

        this.bgColorDark = engine.math.colorMult(ctx.fillStyle, 0.75);  //Calculate dark color
        this.bgColorBright = engine.math.colorAdd(ctx.fillStyle, 48);   //Calculate bright color

        ctx.fillStyle = this.bhColor;   //Color

        this.bhColorDark = engine.math.colorMult(ctx.fillStyle, 0.75);  //Calculate dark color
        this.bhColorBright = engine.math.colorAdd(ctx.fillStyle, 48);   //Calculate bright color
    },

    //Game object update
    update : function(dt) {
        
        var pos = engine.mouse.getPos();        //
        
        //Set hover if the cursor is inside the button area
        this.hover = engine.math.colPointRect(  //Check collision between cursor and button
            pos.x,                              //Cursor x-pos
            pos.y,                              //Cursor y-pos
            this.spos.x - this.size.x / 2,      //Button x-corner
            this.spos.y - this.size.y / 2,      //Button y-corner
            this.size.x,                        //Button width
            this.size.y);                       //Button height
        
        //If the cursor is over the button
        if (this.hover) {

            //Mouse states
            switch(engine.mouse.getMouseState()) {          //Get mouse state for different cursor-buttone events

                //Cursor is not pressed
                case engine.mouse.mouseStates.ISRELEASED :  //If cursor is not pressed

                    this.state = this.states.NONE;          //NONE state
                    break;

                //Cursor is pressed
                case engine.mouse.mouseStates.WASPRESSED :  //If cursor was pressed

                    this.state = this.states.PRESS;         //PRESS state
                    break;

                //Cursor was released
                case engine.mouse.mouseStates.WASRELEASED : //If cursor was released

                    if (this.state == this.states.PRESS) {  //If button is in the PRESS state

                        this.doButtonAction();              //Do the button's action
                        this.state = this.states.NONE;      //Return to NONE state
                    }
                    break;
            }
        }
        else {                                              //If the cursor is not over the button
            
            //Go from pressed state to none state if cursor is released outside the button
            if (this.state == this.states.PRESS &&          //If pressed but mouse is released
                engine.mouse.getMouseState() == engine.mouse.mouseStates.ISRELEASED) {

                this.state = this.states.NONE;              //NONE state
            }
        }
    },

    //Default button action
    doButtonAction : function() {

        console.log(this.text); //Log this button's text as a default action
    },

    //Game object draw
    draw : function(ctx) {
        
        var buttonDepth;

        //Offset for pressed state or draw border faces otherwise
        if(this.state == this.states.PRESS)  {          //If this button is pressed
            
            buttonDepth = engine.math.zDepth / 8;       //Pressed depth
            ctx.translate(buttonDepth, -buttonDepth);   //Offset to move button face
        }
        else {
            buttonDepth = engine.math.zDepth / 4;       //Normal depth
        }

        //Button top face color
        ctx.fillStyle = this.hover ?    //If cursor is hovering
            this.bhColorBright :        //Hover color
            this.bgColorBright;         //Background color

        //Draw button top face
        ctx.beginPath();
        ctx.moveTo(-this.size.x / 2,               -this.size.y / 2);               //Lower Right
        ctx.lineTo(-this.size.x / 2 + buttonDepth, -this.size.y / 2 - buttonDepth); //Upper Right
        ctx.lineTo( this.size.x / 2 + buttonDepth, -this.size.y / 2 - buttonDepth); //Upper Left
        ctx.lineTo( this.size.x / 2,               -this.size.y / 2);               //Lower Left
        ctx.fill();

        //Button right face color
        ctx.fillStyle = this.hover ?    //If cursor is hovering
            this.bhColorDark :          //Hover color
            this.bgColorDark;           //Background color

        //Draw button right face
        ctx.beginPath();
        ctx.moveTo(this.size.x / 2,               -this.size.y / 2);                //Upper Left
        ctx.lineTo(this.size.x / 2 + buttonDepth, -this.size.y / 2 - buttonDepth);  //Upper Right
        ctx.lineTo(this.size.x / 2 + buttonDepth,  this.size.y / 2 - buttonDepth);  //Lower Left
        ctx.lineTo(this.size.x / 2,                this.size.y / 2);                //Lower Right
        ctx.fill();

        //Button rectangle color
        ctx.fillStyle = this.hover ?    //If cursor is hovering
            this.bhColor :              //Hover color
            this.bgColor;               //Background color

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