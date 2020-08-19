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

    function colorMult(color, mult) {
        var channels = [];

        for(i = 0; i < 3; i++) {
            channels[i] = color.substr(2 * i + 1, 2);
        }

        channels.forEach((c, i) => channels[i] = clamp(Math.round(parseInt(c, 16) * mult), 0, 255));
        channels.forEach((c, i) => channels[i] = ("0" + c.toString(16)).substr(-2));

        return "#" + channels.join('');
    }
    
	//Return
	return {
        gmultx,
        gmulty,
        colPointRect,
        colPointRectGrid,
        col1D,
        clamp,
        colorMult
    }
    
}());