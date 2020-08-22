//Cursor object
var Cursor = function(args) { GameObject.call(this, args);

    this.ppos = new Vect(0, 0);                 //Previous pressed position
    this.pLength = 10;                          //Distance to enter carry state
    this.pDir = 0;                              //Direction the cursor was dragged in.

    this.originalRadius = args.radius || 4      //Starting radius of the cursor
    this.radius = this.originalRadius;          //Current radius of the cursor

    this.originalColor = args.color || "white"  //Starting color of the cursor
    this.color = this.originalColor;            //Current color of the cursor

    this.states = Object.freeze({               //Cursor states
        NONE : 0,
        DRAG : 1,
        CARRY : 2
    });

    this.state = this.states.NONE;              //Current cursor state
}

Cursor.prototype = Object.create(GameObject.prototype);

//Initialize a game object after its scene is loaded.
Cursor.prototype.init = function(ctx) {
    this.brickHandler = engine.tag.get("BrickHandler", "GameScene")[0];
}

//Game object update
Cursor.prototype.update = function(dt) {
    this.spos = engine.mouse.getPos();

    this.color = this.originalColor;
    this.radius = this.originalRadius;

    //Get difference between current and pressed positions
    var diff = this.spos.y - this.ppos.y;

    //Carrying states
    switch(this.state) {

        //DRAGGING
        case this.states.DRAG :
            if(Math.abs(diff) > this.pLength) {                             //If we've dragged a sufficient distance
                                                                        
                this.pDir = Math.sign(diff);                                //Get the direction we're selecting bricks in
                if(this.brickHandler.selectBricks(this.ppos, this.pDir)){   //Select bricks
                    this.parent.sortGO();                                   //Sort for new brick z-indices
                    this.state = this.states.CARRY;                         //Start carrying if we selected some bricks
                }   
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
        case engine.mouse.mouseStates.WASPRESSED : this.radius = 15;

            if(this.state == this.states.NONE) {
                //Deselect bricks for a new selection
                this.brickHandler.deselectBricks();
        
                //If this cursor selected a brick, set it to DRAGGING state.
                if(this.brickHandler.pressBricks(this.spos)) {
                    this.state = this.states.DRAG;
                    this.ppos = this.spos;
                }
            }
            break;

        //WASRELEASED
        case engine.mouse.mouseStates.WASRELEASED : this.radius = 15;

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

//Game object draw
Cursor.prototype.draw = function(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
    ctx.fill();
}