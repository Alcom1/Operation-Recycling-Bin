//engine
var engine = engine || {};

//Module that plays and manages sounds.
engine.managerMouse = (function() {

    var mousePos; //Mouse position.
    var mousePressed = false;
    var flip = false;

	//Init
	function init(element) {

        mousePos = new Vect(0, 0);
        element.addEventListener("mousedown", function() {
            mousePressed = true;
        })
        element.addEventListener("mouseup", function() {
            mousePressed = false;
        })
    }
    
    //Update the mouse for a frame
    function update(dt) {

        flip = !mousePressed;
    }
    
    //Update the mouse position.
    function updatePos(e) {

        mousePos = getMouse(e);
    }
    
    // returns mouse position in local coordinate system of element
    function getMouse(e) {

        var mouse = new Vect(
            e.pageX - e.target.offsetLeft,
            e.pageY - e.target.offsetTop,
            0);
        return mouse;
    }
    
    //Returns the mouse position
    function getPos() {

        return mousePos;
    }

    //Returns if mouse is pressed
    function isPressed() {

        return mousePressed;
    }

    //Returns if mouse was pressed last frame
    function wasPressed() {

        return mousePressed && flip;
    }

    //Returns if mouse was relesed pre
    function wasReleased() {

        return !mousePressed && !flip;
    }
    
	//Return
	return {
        init : init,
        update : update,
        updatePos : updatePos,
        getPos : getPos,
        isPressed : isPressed,
        wasPressed : wasPressed,
        wasReleased : wasReleased
    }
    
}());