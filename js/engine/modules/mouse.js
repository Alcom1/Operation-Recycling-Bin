//engine
var engine = engine || {};

//Module that plays and manages sounds.
engine.managerMouse = (function() {

    var mousePos; //Mouse position.
    var mousePressed = false;
    var flip = false;

    var mouseStates = Object.freeze({
        ISRELEASED : 0,
        WASPRESSED : 1,
        ISPRESSED : 2,
        WASRELEASED : 3,
    })

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

    //Get the current state of the mouse
    function getMouseState() {
        
        if (mousePressed && flip) {
            return mouseStates.WASPRESSED
        }
        else if(mousePressed) {
            return mouseStates.ISPRESSED
        }
        else if(!mousePressed && !flip) {
            return mouseStates.WASRELEASED
        }
        else {
            return mouseStates.ISRELEASED
        }
    }
    
	//Return
	return {
        init,
        update,
        updatePos,
        getPos,
        getMouseState,
        mouseStates
    }
    
}());