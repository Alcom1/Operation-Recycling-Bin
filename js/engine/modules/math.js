//engine
var engine = engine || {}

//Main object literal
engine.math = (function() {

    //constrained between min and max (inclusive)
    function clamp(val, min, max) {

        return Math.max(min, Math.min(max, val));
    }
    
	//Return
	return {
        clamp : clamp,
    }
    
}());