//engine
var engine = engine || {}

//Main object literal
engine.math = (function() {

    //Constants, grouped into a single object because I want to.
    var constant = Object.freeze({
        gmultx :            30,     //Horizontal multiplier for grid positions
        gmulty :            36,     //Vertical multiplier for grid positions
        underCursorZIndex : 100,    //Z-index to place objects beneath the cursor
        lineWidth :         2,      //Thickness of lines
        studRadius :        11,     //Radius of studs
        studHeight :        6,      //Height of studs
        zDepth :            22      //Distance to draw depth
    });

    //Environment boundary
    var boundary = Object.freeze({
        minx : 0,                   //Minimum X-position
        miny : 2,                   //Minimum Y-position
        maxx : 35,                  //Maximum X-position
        maxy : 24                   //Maximum Y-position
    })

    //constrain value between min and max (inclusive)
    function clamp(val, min, max) {

        return Math.max(min, Math.min(max, val));
    }

    //Round a value to the nearest target
    function round(val, target) {
        
        return Math.round(val / target) * target;
    }

    //Collision between a bar and a bounding box but with grid coordinates
    function colBorderBoxGrid(x, y, w) {

        return (
            x <          boundary.minx ||   //Lower horizontal bound
            y <          boundary.miny ||   //Lower vertical bound
            x + w - 1 >= boundary.maxx ||   //Upper horiziontal bound with width
            y >=         boundary.maxy);    //Upper vertical bound
    }

    //Point-rectangle collison
    function colPointRect(px, py, rx, ry, rw, rh) {
        
        return (
            px >= rx      &&    //Lower horizontal bound
            py >= ry      &&    //Lower vertical bound
            px <  rx + rw &&    //Upper horiziontal bound
            py <  ry + rh);     //Upper vertical bound
    }

    //Point-rectangle collison but with grid coordinates
    function colPointRectGrid(px, py, rx, ry, rw) {
        
        return colPointRect(
            px,                     //Point-X
            py,                     //Point-y
            rx * constant.gmultx,   //Rect-x
            ry * constant.gmulty,   //Rect-y
            rw * constant.gmultx,   //Rect-width
            constant.gmulty);       //Assume height = 1
    }

    //Point-parallelogram (Horizontal) collison
    function colPointParH(px, py, rx, ry, rw, rh) {
        
        return (
            px >= rx      - py + ry &&  //Horizontal tilt
            py >= ry                &&
            px <  rx + rw - py + ry &&  //Horizontal tilt
            py <  ry + rh);
    }

    //Point-parallelogram (Horizontal) collison but with grid coordinates
    function colPointParHGrid(px, py, rx, ry, rw) {
        
        return colPointParH(
            px,                                     //Point-X
            py,                                     //Point-y
            rx * constant.gmultx + constant.zDepth, //Para-x
            ry * constant.gmulty - constant.zDepth, //Para-y
            rw * constant.gmultx,                   //Para-width
            constant.zDepth);                       //Para-height
    }

    //Point-parallelogram (Vertical) collison
    function colPointParV(px, py, rx, ry, rw, rh) {
        
        return (
            px >= rx                &&
            py >= ry      - px + rx &&  //Vertical tilt
            px <  rx + rw           &&
            py <  ry + rh - px + rx);   //Vertical tilt
    }

    //Point-parallelogram (Vertical) collison but with grid coordinates
    function colPointParVGrid(px, py, rx, ry, rw) {
        
        return colPointParV(
            px,                                             //Point-X
            py,                                             //Point-y
            rx * constant.gmultx + rw * constant.gmultx,    //Para-x
            ry * constant.gmulty,                           //Para-y
            constant.zDepth,                                //Para-width
            constant.gmulty);                               //Para-height
    }

    //1-dimensional collision to check vertical overlap
    function col1D(a1, a2, b1, b2) {
        
        return a2 > b1 && a1 < b2;  //Return if A and B objects overlap
    }

    //Translate text colors to custom values
    function colorTranslate(color) {

        switch(color){

            case undefined: return "#999999"    //No color translates to grey
            case "white":   return "#EEEEEE"
            case "blue" :   return "#0033FF"
            case "yellow":  return "#FFCC00"
            case "red":     return "#CC0000"
            default:        return color;       //Color unchanged
        }
    }

    //Multiply by a value all channels in a hex color
    function colorMult(color, value) {

        return colorChange(
            color,              //Color to be modified
            value,              //Value to apply to this color
            function(c, v) {    //Multiplicative function
                return parseInt(c, 16) * v;
            })
    }

    //Add a value to all channels in a hex color
    function colorAdd(color, value) {

        return colorChange(
            color,              //Color to be modified
            value,              //Value to apply to this color
            function(c, v) {    //Additive function
                return parseInt(c, 16) + v;
            })
    }

    //Modify a color given a value and modifier function
    function colorChange(color, value, func) {

        var channels = [];                              //Array of individual color channels

        //There are THREE channels.
        for(i = 0; i < 3; i++) {
            channels[i] = color.substr(2 * i + 1, 2);   //For each channel, store its digits in the channels
        }

        channels.forEach((c, i) => channels[i] = clamp(Math.round(func(c, value)), 0, 255));    //Convert to decimal and apply function
        channels.forEach((c, i) => channels[i] = ("0" + c.toString(16)).substr(-2));            //Convert back to 2-digit hex

        return "#" + channels.join('');                 //Return recomposed color
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
        boundary : boundary,
        colPointRect,
        colBorderBoxGrid,
        colPointRectGrid,
        colPointParHGrid,
        colPointParVGrid,
        col1D,
        clamp,
        round,
        colorTranslate,
        colorMult,
        colorAdd
    }
    
}());