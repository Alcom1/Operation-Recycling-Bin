//engine
var engine = engine || {}

//Main object literal
engine.math = (function() {

    var constant = Object.freeze({
        gmultx :            15,
        gmulty :            18,
        drawOffset :        14,
        underCursorZIndex : 49000
    });

    //constrain value between min and max (inclusive)
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
            rx * constant.gmultx,
            ry * constant.gmulty,
            rw * constant.gmultx,
            rh * constant.gmulty);
    }

    function col1D(a1, a2, b1, b2) {
        
        return a2 > b1 && a1 < b2
    }

    function colorTranslate(color) {
        switch(color){
            case undefined: return "grey"
            case "red":     return "#CC0000"
            case "yellow":  return "#FFCC00"
            default:        return color;
        }
    }

    function colorMult(color, mult) {
        return colorChange(color, mult, function(c, v) { 
            return parseInt(c, 16) * v;
        })
    }

    function colorAdd(color, add) {
        return colorChange(color, add, function(c, v) { 
            return parseInt(c, 16) + v;
        })
    }

    function colorChange(color, val, func) {
        var channels = [];

        for(i = 0; i < 3; i++) {
            channels[i] = color.substr(2 * i + 1, 2);
        }

        channels.forEach((c, i) => channels[i] = clamp(Math.round(func(c, val)), 0, 255));
        channels.forEach((c, i) => channels[i] = ("0" + c.toString(16)).substr(-2));

        return "#" + channels.join('');
    }
    
    //Return
    return {
        gmultx :            constant.gmultx,
        gmulty :            constant.gmulty,
        drawOffset :        constant.drawOffset,
        underCursorZIndex : constant.underCursorZIndex,
        colPointRect,
        colPointRectGrid,
        col1D,
        clamp,
        colorTranslate,
        colorMult,
        colorAdd
    }
    
}());