//Cursor object
var Cursor = function(args) { GameObject.call(this, args);

    this.color = args.color || "white";
}

Cursor.prototype = Object.create(GameObject.prototype);

//Game object update
Cursor.prototype.update = function(dt) {
    this.spos = engine.managerMouse.getPos();
}

//Game object draw
Cursor.prototype.draw = function(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, 2 * Math.PI);
    ctx.fill();
}