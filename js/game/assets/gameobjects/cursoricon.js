//Cursor icon object
var CursorIcon = function(args) { GameObject.call(this, args);

    this.cursorURLs = {};           //Image urls for each type of cursor
}

//Cursor icon prototype
CursorIcon.prototype = 
Object.create(GameObject.prototype);
Object.assign(CursorIcon.prototype, {

    //Initialize a game object after its scene is loaded.
    init : function(ctx, scenes) {
        
        this.cursorURLs['none'] = engine.baker.bake(            //Bake cursor image for NONE state
            this,                                               //Pass self
            function(ctx) {                                     //Function to draw the default cursor
                this.drawCursorBase(ctx);                       //Draw base cursor
            }, 32, 32,                                          //Set width and height to contain 
            "CURSOR.NONE");                                     //Tag this cursor image

        this.cursorURLs['drag'] = engine.baker.bake(            //Bake cursor image for DRAG state
            this,                                               //Pass self
            function(ctx) {                                     //Function to draw the default cursor
                this.drawCursorBase(ctx);                       //Draw base cursor
                this.drawDecalArrowDouble(ctx);                 //Draw DRAG decal
            }, 32, 32,                                          //Set width and height to contain 
            "CURSOR.DRAG");                                     //Tag this cursor image        

        this.cursorURLs['carry'] = engine.baker.bake(           //Bake cursor image for CARRY state
            this,                                               //Pass self
            function(ctx) {                                     //Function to draw the default cursor
                this.drawCursorBase(ctx);                       //Draw base cursor
                this.drawDecalArrowQuad(ctx);                   //Draw CARRY decal
            }, 32, 32,                                          //Set width and height to contain 
            "CURSOR.CARRY");                                    //Tag this cursor image     
            
        this.cursorURLs['hover'] = engine.baker.bake(           //Bake cursor image for HOVER BOTH state
            this,                                               //Pass self
            function(ctx) {                                     //Function to draw the default cursor
                this.drawCursorBase(ctx);                       //Draw base cursor
                this.drawDecalArrowDouble(ctx);                 //Draw HOVER decal
            }, 32, 32,                                          //Set width and height to contain 
            "CURSOR.HOVER.INDY");                               //Tag this cursor image
            
        this.cursorURLs['hoverdown'] = engine.baker.bake(       //Bake cursor image for HOVER DOWN state
            this,                                               //Pass self
            function(ctx) {                                     //Function to draw the default cursor
                this.drawCursorBase(ctx);                       //Draw base cursor
                this.drawDecalArrowDown(ctx);                   //Draw HOVER decal
            }, 32, 32,                                          //Set width and height to contain 
            "CURSOR.HOVER.DOWN");                               //Tag this cursor image
            
        this.cursorURLs['hoverup'] = engine.baker.bake(         //Bake cursor image for HOVER UP state
            this,                                               //Pass self
            function(ctx) {                                     //Function to draw the default cursor
                this.drawCursorBase(ctx);                       //Draw base cursor
                this.drawDecalArrowUp(ctx);                     //Draw HOVER decal
            }, 32, 32,                                          //Set width and height to contain 
            "CURSOR.HOVER.UP");                                 //Tag this cursor image

        this.setCursor('none');                                 //Initial cursor
    },

    //Sets the cursor to match the provided state
    setCursor : function(state) {

        engine.mouse.setCursorURL(this.cursorURLs[state]);
    },

    //Draw base cursor image
    drawCursorBase : function(ctx) {

        ctx.fillStyle = "#FFF";                 //Base cursor fill color
        ctx.strokeStyle = "#666";               //Base cursor border color
        ctx.lineWidth = 1.5;                    //Base cursor border width
        ctx.lineJoin = "round";                 //Base cursor line style

        ctx.beginPath();                        //Start path
        ctx.moveTo(1,  1);                      //Top vertex
        ctx.lineTo(1, 11);                      //Lower left vertex
        ctx.lineTo(11, 1);                      //Lower right vertex
        ctx.closePath();                        //Close path
        ctx.fill();                             //Fill cursor
        ctx.stroke();                           //Draw cursor border

        ctx.beginPath();                        //Start path
        ctx.arc(16, 16, 12, 0, 2 * Math.PI);    //Circle for icons
        ctx.closePath();                        //Close path
        ctx.fill();                             //Fill cursor
        ctx.stroke();                           //Draw cursor border
    },

    //Draw hover decal for cursor
    drawDecalArrowDouble : function(ctx) {

        ctx.fillStyle = "#444";                 //Hover decal color
        ctx.translate(16, 16);                  //Translate. Drag decal is drawn around this center.
        ctx.beginPath();                        //Start path

        for(var i = 0; i < 2; i++) {            //Draw two opposing arrows

            ctx.lineTo( 5,  3);                 //Right arrow vertex
            ctx.lineTo( 0,  9);                 //Peak arrow vertex
            ctx.lineTo(-5,  3);                 //Left arrow vertex
        
            ctx.lineTo(-2,  3);                 //Stalk base
            ctx.lineTo(-2, -3);                 //Stalk extended to other side

            ctx.rotate(Math.PI);                //Rotate for second arrow
        }

        ctx.closePath();
        ctx.fill();
    },

    //Draw hover decal for cursor
    drawDecalArrowDown : function(ctx) {

        ctx.translate(16, 17);  //Translate. Drag decal is drawn around this center.

        this.drawDecalArrow(ctx);
    },

    //Draw hover decal for cursor
    drawDecalArrowUp : function(ctx) {

        ctx.translate(16, 15);  //Translate. Drag decal is drawn around this center.
        ctx.rotate(Math.PI);    //Rotate for second arrow

        this.drawDecalArrow(ctx);
    },

    //Draw a cursor arrow decal
    drawDecalArrow : function(ctx) {

        ctx.fillStyle = "#444"; //Arrow decal color

        ctx.beginPath();        //Start path

        ctx.lineTo( 5,  0);     //Right arrow vertex
        ctx.lineTo( 0,  7);     //Peak arrow vertex
        ctx.lineTo(-5,  0);     //Left arrow vertex
    
        ctx.lineTo(-2,  0);     //Stalk base
        ctx.lineTo(-2, -8);     //Stalk extended to other side
        
        ctx.lineTo( 2, -8);     //Stalk extended to other side
        ctx.lineTo( 2,  0);     //Stalk base

        ctx.closePath();
        ctx.fill();
    },

    //Draw hover decal for cursor
    drawDecalArrowQuad : function(ctx) {
        
        ctx.translate(16, 16);          //Translate. Carry decal is drawn around this center.

        ctx.rotate(Math.PI / 4);        //Rotate 8th circle
        ctx.fillStyle = "#333";         //Outer diamond color
        ctx.fillRect(-6, -6, 12, 12);   //Draw diamond

        ctx.rotate(Math.PI / 4);        //Rotate 8th circle
        ctx.fillStyle = "#FFF";         //Inner square color
        ctx.fillRect(-4.5, -4.5, 9, 9); //Draw square
    },
});
