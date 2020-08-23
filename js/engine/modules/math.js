//engine
var engine = engine || {}

//Main object literal
engine.math = (function() {

    //Constants, grouped into a single object because I want to.
    var constant = Object.freeze({
        gmultx :            30,     //Horizontal multiplier for grid positions
        gmulty :            36,     //Vertical multiplier for grid positions
        underCursorZIndex : 49000,  //Z-index to place objects beneath the cursor
        lineWidth :         2,      //Thickness of lines
        studRadius :        11,     //Radius of studs
        studHeight :        6,      //Height of studs
        zDepth :            22      //Distance to draw depth
    });

    //constrain value between min and max (inclusive)
    function clamp(val, min, max) {

        return Math.max(min, Math.min(max, val));
    }

    //Point-rectangle collison
    function colPointRect(px, py, rx, ry, rw, rh) {
        
        return px >= rx &&
            py >= ry &&
            px < rx + rw  &&
            py < ry + rh;
    }

    //Point-rectangle collison but with grid coordinates
    function colPointRectGrid(px, py, rx, ry, rw) {
        
        return colPointRect(
            px,
            py,
            rx * constant.gmultx,
            ry * constant.gmulty,
            rw * constant.gmultx,
            constant.gmulty);
    }

    //Point-parallelogram (Horizontal) collison
    function colPointParH(px, py, rx, ry, rw, rh) {
        
        return px >= rx - py + ry &&
            py >= ry &&
            px < rx + rw - py + ry &&
            py < ry + rh;
    }

    //Point-parallelogram (Horizontal) collison but with grid coordinates
    function colPointParHGrid(px, py, rx, ry, rw) {
        
        return colPointParH(
            px,
            py,
            rx * constant.gmultx + constant.zDepth,
            ry * constant.gmulty - constant.zDepth,
            rw * constant.gmultx,
            constant.zDepth);
    }

    //Point-parallelogram (Vertical) collison
    function colPointParV(px, py, rx, ry, rw, rh) {
        
        return px >= rx &&
            py >= ry - px + rx &&
            px < rx + rw &&
            py < ry + rh - px + rx;
    }

    //Point-parallelogram (Vertical) collison but with grid coordinates
    function colPointParVGrid(px, py, rx, ry, rw) {
        
        return colPointParV(
            px,
            py,
            rx * constant.gmultx + rw * constant.gmultx,
            ry * constant.gmulty,
            constant.zDepth,
            constant.gmulty);
    }

    //1-dimensional collision to check vertical overlap
    function col1D(a1, a2, b1, b2) {
        
        return a2 > b1 && a1 < b2
    }

    //Translate text colors to custom values
    function colorTranslate(color) {
        switch(color){
            case undefined: return "grey"
            case "red":     return "#CC0000"
            case "yellow":  return "#FFCC00"
            default:        return color;
        }
    }

    //Multiply by a value all channels in a hex color
    function colorMult(color, mult) {
        return colorChange(color, mult, function(c, v) { 
            return parseInt(c, 16) * v;
        })
    }

    //Add a value to all channels in a hex color
    function colorAdd(color, add) {
        return colorChange(color, add, function(c, v) { 
            return parseInt(c, 16) + v;
        })
    }

    //Modify a color given a value and modifier function
    function colorChange(color, val, func) {
        var channels = [];

        //There are THREE channels.
        for(i = 0; i < 3; i++) {
            channels[i] = color.substr(2 * i + 1, 2);
        }

        channels.forEach((c, i) => channels[i] = clamp(Math.round(func(c, val)), 0, 255));  //Convert to decimal and apply function
        channels.forEach((c, i) => channels[i] = ("0" + c.toString(16)).substr(-2));        //Convert back to 2-digit hex

        return "#" + channels.join('');
    }
    
    //Return
    return {
        gmultx :            constant.gmultx,
        gmulty :            constant.gmulty,
        underCursorZIndex : constant.underCursorZIndex,
        lineWidth :         constant.lineWidth,
        studRadius :        constant.studRadius,
        studHeight :        constant.studHeight,
        zDepth :            constant.zDepth,
        colPointRectGrid,
        colPointParHGrid,
        colPointParVGrid,
        col1D,
        clamp,
        colorTranslate,
        colorMult,
        colorAdd
    }
    
}());