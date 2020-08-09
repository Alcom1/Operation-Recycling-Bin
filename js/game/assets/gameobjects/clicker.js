//Clicker object
var Clicker = function(args) { TextDrawer.call(this, args);

}

Clicker.prototype = Object.create(TextDrawer.prototype);

//Game object update
Clicker.prototype.update = function(dt) {
    var currentMouse = engine.managerMouse.getPos();
    this.text = "{" + currentMouse.x + "," + currentMouse.y + "}";
}