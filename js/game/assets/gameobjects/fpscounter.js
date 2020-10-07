//FPS counter game object
var FPSCounter = function(args) { GameObject.call(this, args);

    this.font = args.font || "18pt Consolas";   //Font and default font
    this.color = args.color || "white";         //Color and default color

    this.text = "";                             //Text for FPS counter
}

//FPS counter prototype
FPSCounter.prototype = 
Object.create(GameObject.prototype);
Object.assign(FPSCounter.prototype, {

    //Game object update
    update : function(dt) {

        this.text = "fps: " + (1 / dt).toFixed(1);  //FPS is inverted delta time, measure to a single decimal point.
    },

    //Game object draw
    draw : function(ctx) {
        
        ctx.textBaseline = "top";       //Top baseline
        ctx.font = this.font;           //Font
        ctx.fillStyle = this.color;     //Color
        ctx.fillText(this.text, 2, 0);  //Fill FPS counter text
    }
});