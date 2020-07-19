//Test point object
var TextDrawer = function(args) {

    GameObject.call(this, args);
    
    this.gpos = new Vect(args.position.x, args.position.y);
    this.text = args.text;
    this.font = args.font || "16pt Consolas";
    this.color = args.color || "white";
    this.centered = !!args.centered;
}

TextDrawer.prototype = Object.create(GameObject.prototype);

//Game object draw
TextDrawer.prototype.draw = function(ctx) {
    
    if(this.centered)
    {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle"; 
    }
    ctx.font = this.font;
    ctx.fillStyle = this.color; 
    ctx.fillText(this.text, 0, 0);
}