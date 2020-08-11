//Cursor object
var Cursor = function(args) { GameObject.call(this, args);

    this.originalRadius = args.radius || 8
    this.radius = this.originalRadius;

    this.originalColor = args.color || "white"
    this.color = this.originalColor;
}

Cursor.prototype = Object.create(GameObject.prototype);

//Initialize a game object after its scene is loaded.
GameObject.prototype.init = function() {
    this.bricks = engine.managerTag.get("Brick", "GameScene");
}

//Game object update
Cursor.prototype.update = function(dt) {
    this.spos = engine.managerMouse.getPos();

    this.color = this.originalColor
    this.radius = this.originalRadius;

    if(engine.managerMouse.isPressed()) {

        this.radius = 15;
    }
    if(engine.managerMouse.wasPressed() || engine.managerMouse.wasReleased()) {

        this.color = "yellow"
        this.radius = 50;
    }
    if(engine.managerMouse.wasPressed()) {

        this.bricks.forEach(b => {
            var minX = b.gpos.x * engine.math.gmultx
            var minY = b.gpos.y * engine.math.gmulty

            if(
                this.spos.x > minX &&
                this.spos.y > minY &&
                this.spos.x < minX + engine.math.gmultx * b.width  &&
                this.spos.y < minY + engine.math.gmulty )
            {
                b.color = "Green"
            }
        });
    }
}

//Game object draw
Cursor.prototype.draw = function(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
    ctx.fill();
}