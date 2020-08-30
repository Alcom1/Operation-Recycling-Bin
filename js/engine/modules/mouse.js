//engine
var engine = engine || {};

//Module that manages mouse movement and states.
engine.mouse = (function() {

    var mouseElement = null;    //HTML Element for mouse events
    var mousePos = null;        //Mouse position.
    var mousePressed = false;   //If the mouse is pressed
    var afterPressed = false;   //Is different from mousePressed on frames where the mouse state has changed
    var isMobile = false;       //If the enviornment is mobile

    //Mouse press states
    var mouseStates = Object.freeze({
        ISRELEASED : 0,         //Mouse is not pressed
        WASPRESSED : 1,         //Mouse was pressed last frame
        ISPRESSED : 2,          //Mouse is pressed
        WASRELEASED : 3,        //Mouse was released last frame
    })

    //Init
    function init(element) {

        mouseElement = element;                                         //Set mouse element
        mousePos = new Vect(0, 0);                                      //Set mouse position to default position
        isMobile =                                                      //Set mobile environment status
            navigator.maxTouchPoints ||                                 //True for mobile environment
            'ontouchstart' in document.documentElement;                 //True for mobile environment (Desktop debug)

        if(isMobile) {

            mouseElement.ontouchmove =          updatePos.bind(this);   //Touch movement, move the mouse position
            mouseElement.ontouchstart =         updateTouch.bind(this); //Touch start, move and press the mouse
            mouseElement.ontouchend =   () =>   mousePressed = false;   //Touch end, release the mouse
        }
        else {

            mouseElement.onmousemove =          updatePos.bind(this);   //Mouse move, move the mouse position
            mouseElement.onmousedown =  () =>   mousePressed = true;    //Mouse press
            mouseElement.onmouseup =    () =>   mousePressed = false;   //Mouse release
        }
    }
    
    //Update the mouse for a frame (Should be the last action of a frame)
    function update(dt) {

        afterPressed = mousePressed;    //After a press or release, switch from WAS-state to IS-state
    }

    //Update the mouse position for a touch event
    function updateTouch(e) {

        mousePressed = true;    //Touch event is a press
        updatePos(e);           //Touch event sets the position to here
    }
    
    //Update the mouse position.
    function updatePos(e) {

        mousePos = new Vect(                                            //Set mouse position from event.
            e.offsetX ?? (e.touches[0].pageX - e.target.offsetLeft),    //OffsetX for desktop. Touches for mobile.
            e.offsetY ?? (e.touches[0].pageY - e.target.offsetTop));    //OffsetY for desktop. Touches for mobile.
    }
    
    //Expose the mouse position
    function getPos() {

        return mousePos;    //Return the current mouse position
    }

    //Expose the current state of the mouse
    function getMouseState() {
        
        if (mousePressed && !afterPressed) {        //If mouse is pressed and afterPressed is different
            return mouseStates.WASPRESSED;          //Mouse was pressed this frame
        }
        else if(mousePressed) {                     //If mouse is pressed and afterPressed is same
            return mouseStates.ISPRESSED;           //Mouse is currently pressed
        }
        else if(!mousePressed && afterPressed) {    //If mouse is released and afterPressed is different
            return mouseStates.WASRELEASED;         //Mouse was released this frame
        }
        else {                                      //If mouse is released and afterPressed is same
            return mouseStates.ISRELEASED;          //Mouse is currently released
        }
    }

    //Expose if the current environment is mobile
    function getMobile() {

        return isMobile;    //Return the current mobile state
    }

    //Sets the mouse cursor to a URL
    function setCursorURL(url) {

        mouseElement.style.cursor = "url(" + url + "), auto";   //Apply URL CSS to the mouse element.
    }
    
    //Return
    return {
        init,
        update,
        getPos,
        getMouseState,
        getMobile,
        setCursorURL,
        mouseStates
    }
    
}());