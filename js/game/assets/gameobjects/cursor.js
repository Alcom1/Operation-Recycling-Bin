//Cursor object
var Cursor = function(args) { GameObject.call(this, args);

    this.originalRadius = args.radius || 8
    this.radius = this.originalRadius;

    this.originalColor = args.color || "white"
    this.color = this.originalColor;
}

Cursor.prototype = Object.create(GameObject.prototype);

//Game object update
Cursor.prototype.update = function(dt) {
    this.spos = engine.managerMouse.getPos();

    this.color = this.originalColor
    this.radius = this.originalRadius;

    if(engine.managerMouse.isPressed())
    {
        this.radius = 15;
    }
    if(engine.managerMouse.wasPressed() || engine.managerMouse.wasReleased())
    {
        this.color = "yellow"
        this.radius = 50;
    }
}

//Game object draw
Cursor.prototype.draw = function(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
    ctx.fill();
}