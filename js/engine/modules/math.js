//engine
var engine = engine || {}

//Main object literal
engine.math = (function() {

    var gmultx = 15;
    var gmulty = 18;

    //constrained between min and max (inclusive)
    function clamp(val, min, max) {

        return Math.max(min, Math.min(max, val));
    }

    function colPointRect(px, py, rx, ry, rw, rh) {
        
        return px >= rx &&
            py >= ry &&
            px < rx + rw  &&
            py < ry + rh;
    }

    function colPointRectGrid(px, py, rx, ry, rw, rh) {
        
        return colPointRect(
            px,
            py,
            rx * gmultx,
            ry * gmulty,
            rw * gmultx,
            rh * gmulty);
    }

    function col1D(a1, a2, b1, b2) {
        
        return a2 > b1 && a1 < b2
    }
    
	//Return
	return {
        gmultx,
        gmulty,
        colPointRect,
        colPointRectGrid,
        col1D,
        clamp,
    }
    
}());