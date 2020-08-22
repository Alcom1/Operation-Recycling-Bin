//engine
var engine = engine || {};

//Module bakes images for optimized drawing.
engine.baker = (function() {

    var canvas = undefined,    // Canvas
        ctx = undefined,       // Canvas context
        images = new Map()     // Map for previously drawn images

    //Init
    function init(element) {
        canvas = element;
        ctx = canvas.getContext('2d');
    }

    //Bake an image and return its data using the canvas
    function bake(target, func, width, height, tag) {

        //If an image with this tag has already been baked, return it.
        if(images.has(tag)) {
            return images.get(tag);
        }

        //Stored canvas size to return to.
        var canvasSize = { 
            width : canvas.width, 
            height : canvas.height
        };

        //Temporary canvas size for baking.
        canvas.width = width;
        canvas.height = height;

        ctx.save();
            ctx.clearRect(0, 0, width, height); //Clear canvas for drawing
            func.call(target, ctx);             //Generate image
            var data = canvas.toDataURL();      //Get image data
            images.set(tag, data);              //Store image under this tag
        ctx.restore();

        //Reset canvas size.
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;

        return data;    //Return generated image data
    }
    
    //Return
    return {
        init,
        bake
    }
    
}());