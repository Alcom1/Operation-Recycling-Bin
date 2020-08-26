//Cursor object
var Cursor = function(args) { GameObject.call(this, args);

    this.ppos = new Vect(0, 0);                 //Previous pressed position
    this.pLength = 10;                          //Distance to enter carry state

    this.states = Object.freeze({               //Cursor states
        NONE : 0,
        HOVER : 1,
        DRAG : 2,
        CARRY : 3
    });

    this.cursorURLs = [];

    this.state = this.states.NONE;              //Current cursor state
}

Cursor.prototype = Object.create(GameObject.prototype);

//Initialize a game object after its scene is loaded.
Cursor.prototype.init = function(ctx) {
    this.brickHandler = engine.tag.get("BrickHandler", "GameScene")[0];

    this.cursorURLs[this.states.NONE] = engine.baker.bake(
        this,
        function(ctx) {
            this.drawCursorBase(ctx);
        }, 32, 32,
        "CURSOR.NONE");

    this.cursorURLs[this.states.HOVER] = engine.baker.bake(
        this,
        function(ctx) {
            this.drawCursorBase(ctx);
            this.drawDecalHover(ctx);
        }, 32, 32,
        "CURSOR.HOVER");

    this.cursorURLs[this.states.DRAG] = engine.baker.bake(
        this,
        function(ctx) {
            this.drawCursorBase(ctx);
            this.drawDecalDrag(ctx);
        }, 32, 32,
        "CURSOR.DRAG");

    this.cursorURLs[this.states.CARRY] = engine.baker.bake(
        this,
        function(ctx) {
            this.drawCursorBase(ctx);
            this.drawDecalCarry(ctx);
        }, 32, 32,
        "CURSOR.CARRY");
}

//Game object update
Cursor.prototype.update = function(dt) {

    var tempSpos = engine.mouse.getPos();

    //NONE-HOVER check, switch to hover state if we're hovering over a non-static brick.
    if (this.state == this.states.NONE ||
        this.state == this.states.HOVER &&
        tempSpos.getDiff(this.spos)) {

        if(this.brickHandler.hoverBricks(tempSpos)) {
            this.hover();
        }
        else {
            this.resetState();
        }
    }

    this.spos = tempSpos;

    //Get difference between current and pressed positions
    var diff = this.spos.y - this.ppos.y;

    //Carrying states
    switch(this.state) {

        //DRAGGING
        case this.states.DRAG :
            if(Math.abs(diff) > this.pLength) {     //If we've dragged a sufficient distance

                this.selectBricks(Math.sign(diff)); 
            }
            break;

        //CARRYING
        case this.states.CARRY : 
            //Nothing in CARRY state at the moment.
            break;
    }

    //Mouse states
    switch(engine.mouse.getMouseState()) {

        //WASPRESSED
        case engine.mouse.mouseStates.WASPRESSED :

            if(this.state == this.states.HOVER) {
                //Deselect bricks for a new selection
                this.brickHandler.deselectBricks();
        
                //If pressing the brick returns true (Indeterminate state)
                switch(this.brickHandler.pressBricks(this.spos)) 
                {
                    //Auto-selection occured. Set cursor to its carrying state
                    case true :
                        this.carry();
                        break;

                    //Selection is indeterminate. Go to drag state
                    case false :    
                        this.ppos = this.spos;
                        this.drag();
                        break;
                }
            }
            break;

        //WASRELEASED
        case engine.mouse.mouseStates.WASRELEASED :

            //Reset state upon release
            if(this.state != this.states.CARRY || this.brickHandler.checkSelectionCollision()) {

                //Deselect if we didn't carry yet.
                if(this.states.DRAG) {
                    this.brickHandler.deselectBricks();
                    this.parent.sortGO(); //Sort for new brick z-indices
                }

                this.state = this.states.NONE;
            }
            break;
    }
}

//Draw base cursor image
Cursor.prototype.drawCursorBase = function(ctx) {

    ctx.fillStyle = "#FFF";
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(2,  0);
    ctx.lineTo(2,  28);
    ctx.lineTo(20, 21);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

//Draw hover decal for cursor
Cursor.prototype.drawDecalHover = function(ctx) {

    ctx.fillStyle = "#CCC";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.arc(8.5, 17.5, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}

//Draw hover decal for cursor
Cursor.prototype.drawDecalDrag = function(ctx) {
    
    ctx.fillStyle = "#444";

    ctx.translate(8, 17);

    ctx.beginPath();

    for(var i = 0; i < 2; i++) {

        ctx.lineTo( 3.5,  2);
        ctx.lineTo( 0,    6);
        ctx.lineTo(-3.5,  2);
    
        ctx.lineTo(-1.5,  2);
        ctx.lineTo(-1.5, -2);

        ctx.rotate(Math.PI);
    }

    ctx.closePath();
    ctx.fill();
}

//Draw hover decal for cursor
Cursor.prototype.drawDecalCarry = function(ctx) {
    

    ctx.translate(9, 17.5);

    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = "#333";
    ctx.fillRect(-4, -4, 8, 8);

    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = "#FFF";
    ctx.fillRect(-3, -3, 6, 6);
}

//Select bricks
Cursor.prototype.selectBricks = function(dir) {

    if(this.brickHandler.initSelection(this.ppos, dir)) {    //Select bricks in the given direction
        this.carry();                                        //Enter carry state if we selected bricks
    }  
}

//Set cursor to no state
Cursor.prototype.resetState = function() {
    engine.mouse.setCursorURL(this.cursorURLs[this.states.NONE]);
    this.state = this.states.NONE;
}

//Set cursor to its over state
Cursor.prototype.hover = function() {
    engine.mouse.setCursorURL(this.cursorURLs[this.states.HOVER]);
    this.state = this.states.HOVER;
}

//Set the cursor to its drag state
Cursor.prototype.drag = function() {
    engine.mouse.setCursorURL(this.cursorURLs[this.states.DRAG]);
    this.state = this.states.DRAG;
}

//Set the cursor to its carry state
Cursor.prototype.carry = function() {
    engine.mouse.setCursorURL(this.cursorURLs[this.states.CARRY]);
    this.parent.sortGO();               //Sort for new brick z-indices
    this.state = this.states.CARRY;     //Start carrying if we selected some bricks
}