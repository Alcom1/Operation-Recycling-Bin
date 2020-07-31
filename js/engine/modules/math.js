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
    
	//Return
	return {
        gmultx : gmultx,
        gmulty : gmulty,
        clamp : clamp,
    }
    
}());