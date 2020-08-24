//Cursor object
var Cursor = function(args) { GameObject.call(this, args);

    this.ppos = new Vect(0, 0);                 //Previous pressed position
    this.pLength = 10;                          //Distance to enter carry state

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
        case engine.mouse.mouseStates.WASPRESSED : this.radius = 15;

            if(this.state == this.states.NONE) {
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
                        this.state = this.states.DRAG;
                        break;
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

//Select bricks
Cursor.prototype.selectBricks = function(dir) {

    if(this.brickHandler.initSelection(this.ppos, dir)) {    //Select bricks in the given direction
        this.carry();                                        //Enter carry state if we selected bricks
    }  
}

//Set the cursor to its carry state
Cursor.prototype.carry = function() {
    this.parent.sortGO();               //Sort for new brick z-indices
    this.state = this.states.CARRY;     //Start carrying if we selected some bricks
}