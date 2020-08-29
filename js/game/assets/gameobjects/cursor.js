//Cursor object
var Cursor = function(args) { GameObject.call(this, args);

    this.ppos = new Vect(0, 0);                 //Previous pressed position
    this.pLength = 10;                          //Distance to enter carry state

    this.states = Object.freeze({               //Cursor states
        NONE : 0,                               //None state
        DRAG : 1,                               //Drag state
        CARRY : 2,                              //Carry state
        HOVER : 3                               //Hover state
    });

    this.state = null;                          //Current cursor state
    this.hoverState = null;                     //Current hover state

    this.cursorURLs = [];                       //Image urls for each type of cursor
}

Cursor.prototype = 
Object.create(GameObject.prototype);
Object.assign(Cursor.prototype, {

    //Initialize a game object after its scene is loaded.
    init : function(ctx) {
        this.brickHandler = engine.tag.get("BrickHandler", "GameScene")[0]; //Get BrickHandler game object.

        this.cursorURLs[this.states.NONE] = engine.baker.bake(  //Bake cursor image for NONE state
            this,                                               //Pass self
            function(ctx) {                                     //Function to draw the default cursor
                this.drawCursorBase(ctx);                       //Draw base cursor
            }, 32, 32,                                          //Set width and height to contain 
            "CURSOR.NONE");                                     //Tag this cursor image

        this.cursorURLs[this.states.DRAG] = engine.baker.bake(  //Bake cursor image for DRAG state
            this,                                               //Pass self
            function(ctx) {                                     //Function to draw the default cursor
                this.drawCursorBase(ctx);                       //Draw base cursor
                this.drawDecalDrag(ctx);                        //Draw DRAG decal
            }, 32, 32,                                          //Set width and height to contain 
            "CURSOR.DRAG");                                     //Tag this cursor image        

        this.cursorURLs[this.states.CARRY] = engine.baker.bake( //Bake cursor image for CARRY state
            this,                                               //Pass self
            function(ctx) {                                     //Function to draw the default cursor
                this.drawCursorBase(ctx);                       //Draw base cursor
                this.drawDecalCarry(ctx);                       //Draw CARRY decal
            }, 32, 32,                                          //Set width and height to contain 
            "CURSOR.CARRY");                                    //Tag this cursor image     
            
        this.cursorURLs[                                        //Bake cursor image for HOVER BOTH state
            this.states.HOVER +
            this.brickHandler.states.INDY] = engine.baker.bake( 
            this,                                               //Pass self
            function(ctx) {                                     //Function to draw the default cursor
                this.drawCursorBase(ctx);                       //Draw base cursor
                this.drawDecalHover(ctx);                       //Draw HOVER decal
            }, 32, 32,                                          //Set width and height to contain 
            "CURSOR.HOVER.INDY");                               //Tag this cursor image
            
        this.cursorURLs[                                        //Bake cursor image for HOVER DOWN state
            this.states.HOVER +
            this.brickHandler.states.DOWN] = engine.baker.bake( 
            this,                                               //Pass self
            function(ctx) {                                     //Function to draw the default cursor
                this.drawCursorBase(ctx);                       //Draw base cursor
                this.drawDecalHoverDown(ctx);                   //Draw HOVER decal
            }, 32, 32,                                          //Set width and height to contain 
            "CURSOR.HOVER.DOWN");                               //Tag this cursor image
            
        this.cursorURLs[                                        //Bake cursor image for HOVER UP state
            this.states.HOVER +
            this.brickHandler.states.UP] = engine.baker.bake(   
            this,                                               //Pass self
            function(ctx) {                                     //Function to draw the default cursor
                this.drawCursorBase(ctx);                       //Draw base cursor
                this.drawDecalHoverUp(ctx);                     //Draw HOVER decal
            }, 32, 32,                                          //Set width and height to contain 
            "CURSOR.HOVER.UP");                                 //Tag this cursor image

        this.resetState();                                      //Start state and cursor
    },

    //Game object update
    update : function(dt) {

        var tempSpos = engine.mouse.getPos();                           //Get mouse position and assign it to a temporary value

        //NONE-HOVER check, switch to hover state if we're hovering over a non-static brick.
        if (this.state == this.states.NONE || 
            this.state == this.states.HOVER &&                          //If the current state is NONE Or HOVER
            tempSpos.getDiff(this.spos)) {                              //If the cursor has moved (temp and current positions are different)

            var hoverState = this.brickHandler.hoverBricks(tempSpos);   //Hoverstate, pass it to hover function

            //Handle hover states
            switch(hoverState) {

                case this.brickHandler.states.NONE :                    //Reset state for none state
                    this.resetState();                                  //Reset state to none
                    break;

                case this.brickHandler.states.SAME :                    //Do nothing for same state
                    break;

                default :                                               //All other states are hover
                    this.hover(hoverState);                             //Hover with hover state
                    break;
            }
        }

        this.spos = tempSpos;                                           //Set current position

        
        //Cursor states
        switch(this.state) {                                            //Handle cursor states

            //DRAGGING
            case this.states.DRAG :                                     //If the cursor is in the DRAG state
                var diff = this.spos.y - this.ppos.y;                   //Get difference between current and previously pressed positions
                if(Math.abs(diff) > this.pLength) {                     //If we've dragged a sufficient distance

                    this.selectBricks(Math.sign(diff));                 //Select bricks in the direction of the difference
                }
                break;
        }

        //Mouse states
        switch(engine.mouse.getMouseState()) {                          //Handle mouse states

            //WASPRESSED
            case engine.mouse.mouseStates.WASPRESSED :                  //If the mouse was pressed this frame

                if(this.state == this.states.HOVER) {                   
            
                    //If pressing the brick returns true (Indeterminate state)
                    switch(this.brickHandler.pressBricks(this.spos)) 
                    {
                        //Auto-select state
                        case true :                                     //Auto-selection occured. Carry.
                            this.carry();                               //Enter CARRY state to carry.
                            break;

                        //Indeterminate state.
                        case false :                                    //No selection occured. Selection is indeterminate.
                            this.ppos = this.spos;                      //Set pressed position to the current cursor position
                            this.drag();                                //Enter DRAG state to later determine what direction we're selecting in
                            break;
                    }
                }
                break;

            //WASRELEASED
            case engine.mouse.mouseStates.WASRELEASED :                 //If the mouse was released this frame

                //Reset state upon release
                if (this.state != this.states.CARRY ||                  //If the current state is not carrying
                    this.brickHandler.checkSelectionCollision()) {      //Or if the selection collision is valid for placement

                    this.brickHandler.deselectBricks();                 //Deselect bricks
                    this.parent.sortGO();                               //Sort for new brick z-indices

                    this.state = this.states.NONE;                      //Return to NONE state
                }
                break;
        }
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
    drawDecalHover : function(ctx) {

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
    drawDecalHoverDown : function(ctx) {

        ctx.translate(16, 17);  //Translate. Drag decal is drawn around this center.

        this.drawDecalArrow(ctx);
    },

    //Draw hover decal for cursor
    drawDecalHoverUp : function(ctx) {

        ctx.translate(16, 17);  //Translate. Drag decal is drawn around this center.
        ctx.rotate(Math.PI);    //Rotate for second arrow

        this.drawDecalArrow(ctx);
    },

    //Draw a cursor arrow decal
    drawDecalArrow : function(ctx) {

        ctx.fillStyle = "#444"; //Arrow decal color

        ctx.beginPath();        //Start path

        ctx.lineTo( 5,  3);     //Right arrow vertex
        ctx.lineTo( 0,  9);     //Peak arrow vertex
        ctx.lineTo(-5,  3);     //Left arrow vertex
    
        ctx.lineTo(-2,  3);     //Stalk base
        ctx.lineTo(-2, -5);     //Stalk extended to other side
        
        ctx.lineTo( 2, -5);     //Stalk extended to other side
        ctx.lineTo( 2,  3);     //Stalk base

        ctx.closePath();
        ctx.fill();
    },

    //Draw hover decal for cursor
    drawDecalDrag : function(ctx) {
        
        ctx.fillStyle = "#444";         //Hover decal color
        ctx.translate(16, 16);          //Translate. Drag decal is drawn around this center.
        ctx.beginPath();                //Start path

        for(var i = 0; i < 2; i++) {    //Draw two opposing arrows

            ctx.lineTo( 5,  3);         //Right arrow vertex
            ctx.lineTo( 0,  9);         //Peak arrow vertex
            ctx.lineTo(-5,  3);         //Left arrow vertex
        
            ctx.lineTo(-2,  3);         //Stalk base
            ctx.lineTo(-2, -3);         //Stalk extended to other side

            ctx.rotate(Math.PI);        //Rotate for second arrow
        }

        ctx.closePath();
        ctx.fill();
    },

    //Draw hover decal for cursor
    drawDecalCarry : function(ctx) {
        
        ctx.translate(16, 16);          //Translate. Carry decal is drawn around this center.

        ctx.rotate(Math.PI / 4);        //Rotate 8th circle
        ctx.fillStyle = "#333";         //Outer diamond color
        ctx.fillRect(-6, -6, 12, 12);   //Draw diamond

        ctx.rotate(Math.PI / 4);        //Rotate 8th circle
        ctx.fillStyle = "#FFF";         //Inner square color
        ctx.fillRect(-4.5, -4.5, 9, 9); //Draw square
    },

    //Select bricks
    selectBricks : function(dir) {

        //Initialize the selection, if doing so caused bricks to be carried, enter carry state
        if(this.brickHandler.initSelection(this.ppos, dir)) {    //If initializing selecting caused a brick selection
            this.carry();                                        //Enter carry state
        }  
    },

    //Set cursor to no state
    resetState : function() {

        if(this.state != this.states.NONE) {                                //If the current state is not already NONE

            engine.mouse.setCursorURL(this.cursorURLs[this.states.NONE]);   //Set cursor to NONE cursor
            this.state = this.states.NONE;                                  //Set state to NONE state
        }
    },

    //Set cursor to its over state
    hover : function(hoverState) {


        if(this.state != this.states.HOVER || this.hoverState != hoverState) {              //If the current state is not already HOVER or the hover state changed

            engine.mouse.setCursorURL(this.cursorURLs[this.states.HOVER + hoverState]);     //Set cursor to HOVER cursor

            this.state = this.states.HOVER;                                                 //Set state to NONE state
            this.hoverState = hoverState;                                                   //Set hover state
        }
    },

    //Set the cursor to its drag state
    drag : function() {
        
        if(this.state != this.states.DRAG) {                                //If the current state is not already DRAG

            engine.mouse.setCursorURL(this.cursorURLs[this.states.DRAG]);   //Set cursor to DRAG cursor
            this.state = this.states.DRAG;                                  //Set state to NONE state
        }
    },

    //Set the cursor to its carry state
    carry : function() {

        if(this.state != this.states.CARRY) {                               //If the current state is not already CARRY
            
            engine.mouse.setCursorURL(this.cursorURLs[this.states.CARRY]);  //Set cursor to CARRY cursor
            this.parent.sortGO();                                           //Sort for new brick z-indices
            this.state = this.states.CARRY;                                 //Set state to NONE stateStart carrying if we selected some bricks
        }
    }
});