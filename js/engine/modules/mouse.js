//engine
var engine = engine || {};

//Module that plays and manages sounds.
engine.managerMouse = (function() {

    var mousePos; //Mouse position.

	//Init
	function init()
	{
        mousePos = new Vect(0, 0);
	}
    
    //Update the mouse module.
    function update(e)
    {
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
    function getPos()
    {
        return mousePos;
    }
	
	//Return
	return {
		init : init,
        update : update,
        getPos : getPos,
    }
    
}());