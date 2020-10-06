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

    this.state = this.states.NONE;              //Current cursor state
    this.hoverState = null;                     //Current hover state
    this.snapState = false;                     //Current snap state

    this.level = null;                          //Level containing bricks

    this.isUpdateForced = false;                //If updating is forced
}

//Cursor prototype
Cursor.prototype = 
Object.create(GameObject.prototype);
Object.assign(Cursor.prototype, {

    //Initialize a game object after its scene is loaded.
    init : function(ctx, scenes) {

        this.level = scenes.find(s => s.name == "Level");   //Get level containing bricks.

        this.brickHandler = engine.tag.get(                 //Get BrickHandler game object.
            "BrickHandler", 
            "LevelInterface")[0]; 

        this.cursorIcon = engine.tag.get(                   //Get Cursor Icon game object.
            "CursorIcon", 
            "LevelInterface")[0];
    },

    //Game object update
    update : function(dt) {

        var tempSpos = engine.mouse.getPos();                           //Get mouse position and assign it to a temporary value

        //Handle cursor state when the mouse moves
        if (this.isUpdateForced ||                                      //If we are forcing an update
            tempSpos.getDiff(this.spos)) {                              //If the cursor has moved (temp and current positions are different)

            this.isUpdateForced = false;                                //Reset update forcing
            
            //Cursor states
            switch(this.state) {

                //NOTHING
                case this.states.NONE :                                 //If the current state is NONE

                //HOVERING
                case this.states.HOVER :                                //If the current state is HOVER
                    this.hoverBricks(tempSpos);                         //Handle hover state
                    break;

                //DRAGGING
                case this.states.DRAG :                                 //If the cursor is in the DRAG state
                    var diff = this.spos.y - this.ppos.y;               //Get difference between current and previously pressed positions
                    if(Math.abs(diff) > this.pLength) {                 //If we've dragged a sufficient distance

                        this.selectBricks(Math.sign(diff));             //Select bricks in the direction of the difference
                    }
                    break;

                //CARRYING
                case this.states.CARRY :                                //If the current state is CARRY

                    this.snapState = this.brickHandler.checkSelectionCollision();   //Set snapped state
                    this.brickHandler.setSnappedBricks(this.snapState);             //Snap or unsnapp bricks based on collision result

                    this.level.sortGO();                                            //Sort bricks
                    break;
            }
        }

        this.spos = tempSpos;                                           //Set current position

        //Mouse states
        switch(engine.mouse.getMouseState()) {                          //Handle mouse states

            //WASPRESSED
            case engine.mouse.mouseStates.WASPRESSED :                  //If the mouse was pressed this frame

                if(this.state == this.states.NONE) {                    //MOBILE - If a press event occurs in a NONE state (Only occurs on Mobile)

                    this.hoverBricks(this.spos);                        //MOBILE - Hover states don't occur without a press on mobile
                }
                if(this.state == this.states.HOVER) {                   //If a press event occurs in a HOVER state
            
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
                    this.snapState) {                                   //Or if the bricks are snapped to a valid location

                    this.brickHandler.deselectBricks();                 //Deselect bricks
                    if(this.snapState) {                                //If we are deselecting bricks
                        this.brickHandler.cullBrickStuds();             //Reset culled studs
                    }
                    this.level.sortGO();                                //Sort for new brick z-indices

                    this.isUpdateForced = true;                         //Force updating
                    this.state = this.states.NONE;                      //Return to NONE state
                }
                break;
        }
    },

    //Hover over bricks, change state based on hover state
    hoverBricks : function(pos) {

        var hoverState = this.brickHandler.hoverBricks(pos);    //Hoverstate, pass it to hover function

        //Handle hover states
        switch(hoverState) {

            case this.brickHandler.states.NONE :                //Reset state for none state
                this.resetState();                              //Reset state to none
                break;

            case this.brickHandler.states.SAME :                //Do nothing for same state
                break;

            default :                                           //All other states are hover
                this.hover(hoverState);                         //Hover with hover state
                break;
        }
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

        if(this.state != this.states.NONE) {            //If the current state is not already NONE

            this.cursorIcon.setCursor('none');          //Set cursor to NONE cursor
            this.brickHandler.selectedBrick = null;     //Ensure no brick is selected in the NONE state
            this.state = this.states.NONE;              //Set state to NONE state
        }
    },

    //Set cursor to its over state
    hover : function(hoverState) {

        if(this.state != this.states.HOVER || this.hoverState != hoverState) {  //If the current state is not already HOVER or the hover state changed

            switch(hoverState) {                                                //Show different cursors for different hover states

                case this.brickHandler.states.INDY:                             //If independant state
                    this.cursorIcon.setCursor('hover');                         //Show hover cursor
                    break;

                case this.brickHandler.states.UP:                               //If up state
                    this.cursorIcon.setCursor('hoverup');                       //Show hover up cursor
                    break;

                case this.brickHandler.states.DOWN:                             //If down state
                    this.cursorIcon.setCursor('hoverdown');                     //Show hover down cursor
                    break;
            }

            this.state = this.states.HOVER;                                     //Set state to NONE state
            this.hoverState = hoverState;                                       //Set hover state
        }
    },

    //Set the cursor to its drag state
    drag : function() {
        
        if(this.state != this.states.DRAG) {            //If the current state is not already DRAG

            this.cursorIcon.setCursor('drag');          //Set cursor to DRAG cursor
            this.brickHandler.cullBrickStuds();         //Reset culled studs
            this.state = this.states.DRAG;              //Set state to NONE state
        }
    },

    //Set the cursor to its carry state
    carry : function() {

        if(this.state != this.states.CARRY) {           //If the current state is not already CARRY
            
        this.cursorIcon.setCursor('carry');             //Set cursor to CARRY cursor
        
            this.brickHandler.cullBrickStuds();         //Reset culled studs
            this.brickHandler.setSnappedBricks(true);   //Carried bricks should start as snapped
            this.level.sortGO();                        //Sort for new brick z-indices
            this.state = this.states.CARRY;             //Set state to NONE stateStart carrying if we selected some bricks
        }
    }
});