//CursorPos object
var CursorPos = function(args) { TextDrawer.call(this, args);

}

CursorPos.prototype = Object.create(TextDrawer.prototype);

//Game object update
CursorPos.prototype.update = function(dt) {
    var currentMouse = engine.managerMouse.getPos();
    this.text = "{" + currentMouse.x + "," + currentMouse.y + "}";
}