//Cursor object
var Cursor = function(args) { GameObject.call(this, args);

    this.ppos = new Vect(0, 0);                 //Previous pressed position
    this.pLength = 10;                          //Distance to enter carry state

    this.states = Object.freeze({               //Cursor states
        NONE : 0,                               //None state
        HOVER : 1,                              //Hover state
        DRAG : 2,                               //Drag state
        CARRY : 3                               //Carry state
    });

    this.state = this.states.NONE;              //Current cursor state

    this.cursorURLs = [];                       //Image urls for each type of cursor
}

Cursor.prototype = Object.create(GameObject.prototype);

//Initialize a game object after its scene is loaded.
Cursor.prototype.init = function(ctx) {
    this.brickHandler = engine.tag.get("BrickHandler", "GameScene")[0]; //Get BrickHandler game object.

    this.cursorURLs[this.states.NONE] = engine.baker.bake(  //Bake cursor image for NONE state
        this,                                               //Pass self
        function(ctx) {                                     //Function to draw the default cursor
            this.drawCursorBase(ctx);                       //Draw base cursor
        }, 32, 32,                                          //Set width and height to contain 
        "CURSOR.NONE");                                     //Tag this cursor image

    this.cursorURLs[this.states.HOVER] = engine.baker.bake( //Bake cursor image for HOVER state
        this,                                               //Pass self
        function(ctx) {                                     //Function to draw the default cursor
            this.drawCursorBase(ctx);                       //Draw base cursor
            this.drawDecalHover(ctx);                       //Draw HOVER decal
        }, 32, 32,                                          //Set width and height to contain 
        "CURSOR.HOVER");                                    //Tag this cursor image        

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
}

//Game object update
Cursor.prototype.update = function(dt) {

    var tempSpos = engine.mouse.getPos();                           //Get mouse position and assign it to a temporary value

    //NONE-HOVER check, switch to hover state if we're hovering over a non-static brick.
    if (this.state == this.states.NONE || 
        this.state == this.states.HOVER &&                          //If the current state is NONE Or HOVER
        tempSpos.getDiff(this.spos)) {                              //If the cursor has moved (temp and current positions are different)

        if(this.brickHandler.hoverBricks(tempSpos)) {               //If the cursor is hovering over a brick
            this.hover();                                           //Enter HOVER state
        }
        else {                                                      //If the cursor is not hovering over a brick
            this.resetState();                                      //Enter NONE state
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
                
                this.brickHandler.deselectBricks();                 //Deselect bricks for a new selection
        
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
}

//Draw base cursor image
Cursor.prototype.drawCursorBase = function(ctx) {

    ctx.fillStyle = "#FFF";     //Base cursor fill color
    ctx.strokeStyle = "#666";   //Base cursor border color
    ctx.lineWidth = 1.5;        //Base cursor border width
    ctx.lineJoin = "round";     //Base cursor line style

    ctx.beginPath();            //Start path
    ctx.moveTo(2,  0);          //Top vertex
    ctx.lineTo(2,  28);         //Lower left vertex
    ctx.lineTo(20, 21);         //Lower right vertex
    ctx.closePath();            //Close path
    ctx.fill();                 //Fill cursor
    ctx.stroke();               //Draw cursor border
}

//Draw hover decal for cursor
Cursor.prototype.drawDecalHover = function(ctx) {

    ctx.fillStyle = "#555";                 //Hover decal color
    ctx.lineWidth = 1.5;                    //Hover decal border

    ctx.beginPath();                        //Start path
    ctx.arc(8.5, 17.5, 4, 0, 2 * Math.PI);  //Hover circle
    ctx.fill();                             //Fill circle
    ctx.stroke();                           //Outline circle
}

//Draw hover decal for cursor
Cursor.prototype.drawDecalDrag = function(ctx) {
    
    ctx.fillStyle = "#444";                 //Hover decal color
    ctx.translate(8, 17);                   //Translate. Drag decal is drawn around this center.
    ctx.beginPath();                        //Start path

    for(var i = 0; i < 2; i++) {            //Draw two opposing arrows

        ctx.lineTo( 3.5,  2);               //Right arrow vertex
        ctx.lineTo( 0,    6);               //Peak arrow vertex
        ctx.lineTo(-3.5,  2);               //Left arrow vertex
    
        ctx.lineTo(-1.5,  2);               //Stalk base
        ctx.lineTo(-1.5, -2);               //Stalk extended to other side

        ctx.rotate(Math.PI);                //Rotate for second arrow
    }

    ctx.closePath();
    ctx.fill();
}

//Draw hover decal for cursor
Cursor.prototype.drawDecalCarry = function(ctx) {
    
    ctx.translate(9, 17.5);         //Translate. Carry decal is drawn around this center.

    ctx.rotate(Math.PI / 4);        //Rotate 8th circle
    ctx.fillStyle = "#333";         //Outer diamond color
    ctx.fillRect(-4, -4, 8, 8);     //Draw diamond

    ctx.rotate(Math.PI / 4);        //Rotate 8th circle
    ctx.fillStyle = "#FFF";         //Inner square color
    ctx.fillRect(-3, -3, 6, 6);     //Draw square
}

//Select bricks
Cursor.prototype.selectBricks = function(dir) {

    //Initialize the selection, if doing so caused bricks to be carried, enter carry state
    if(this.brickHandler.initSelection(this.ppos, dir)) {    //If initializing selecting caused a brick selection
        this.carry();                                        //Enter carry state
    }  
}

//Set cursor to no state
Cursor.prototype.resetState = function() {

    if(this.state != this.states.NONE) {                                //If the current state is not already NONE

        engine.mouse.setCursorURL(this.cursorURLs[this.states.NONE]);   //Set cursor to NONE cursor
        this.state = this.states.NONE;                                  //Set state to NONE state
    }
}

//Set cursor to its over state
Cursor.prototype.hover = function() {

    if(this.state != this.states.HOVER) {                               //If the current state is not already HOVER

        engine.mouse.setCursorURL(this.cursorURLs[this.states.HOVER]);  //Set cursor to HOVER cursor
        this.state = this.states.HOVER;                                 //Set state to NONE state
    }
}

//Set the cursor to its drag state
Cursor.prototype.drag = function() {
    
    if(this.state != this.states.DRAG) {                                //If the current state is not already DRAG

        engine.mouse.setCursorURL(this.cursorURLs[this.states.DRAG]);   //Set cursor to DRAG cursor
        this.state = this.states.DRAG;                                  //Set state to NONE state
    }
}

//Set the cursor to its carry state
Cursor.prototype.carry = function() {

    if(this.state != this.states.CARRY) {                               //If the current state is not already CARRY
        
        engine.mouse.setCursorURL(this.cursorURLs[this.states.CARRY]);  //Set cursor to CARRY cursor
        this.parent.sortGO();                                           //Sort for new brick z-indices
        this.state = this.states.CARRY;                                 //Set state to NONE stateStart carrying if we selected some bricks
    }
}