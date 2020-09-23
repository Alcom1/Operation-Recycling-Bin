//BrickHandler object
var BrickHandler = function(args) { GameObject.call(this, args);
    this.rows = [];             //Rows of bricks
    this.bricks = [];           //All bricks
    this.selectedBrick = null;  //Current selected brick
    this.selections = []; //All selected bricks

    this.states = Object.freeze({

        NONE : 0,
        INDY : 1,
        DOWN : 2,
        UP   : 3,
        SAME : 4
    });
}

//Brickhandler prototype
BrickHandler.prototype = 
Object.create(GameObject.prototype);
Object.assign(BrickHandler.prototype, {

    //Initialize a game object after its scene is loaded.
    init : function(ctx, scenes) {

        //Establish bricks
        this.bricks = engine.tag.get("Brick", "Level");                 //Get bricks from scene
        this.bricksGrey = this.bricks.filter(b => b.isGrey == true);    //Grey bricks

        //Add bricks into rows
        this.bricks.forEach(b => this.addBrickToRows(b));               //For each brick, add it into the rows

        //Sort
        this.sortRows();                                                //Sort each row and bricks within rows

        //For each brick, do a recursive check in each direction. If both directions are blocked, it's static.
        this.bricks.forEach(b => {                                                              //For each brick
            b.isStatic = [-1, 1].reduce((a, c) => a && !this.recurseBrick(b, [c], true), true); //Recurse in both directions. If both results are null, set brick to static
            this.bricks.forEach(b => b.clearRecursion());                                       //Clear recursion states after each recursive static check
        });
    },

    //Check selection collision, return true if this is a valid position
    checkSelectionCollision : function() {

        var adjacents = [];  //Adjacency states, contains if we're attatching in the indexed direction.

        //For each selected brick
        for(var brick1 of this.bricks.filter(b => b.isSelected == true)) {

            brick1.setToCursor();   //Force update so the brick position matches this frame and not the previous

            //Combine grid positions and sub positions for true positions
            var tposx = brick1.gpos.x + Math.round(brick1.spos.x / engine.math.gmultx);         //True x-position
            var tposy = brick1.gpos.y + Math.round(brick1.spos.y / engine.math.gmulty);         //True y-position

            //Check collision between current selected brick and every brick in its potential new row.
            for(var brick2 of this.rows.find(r => r.row == tposy)?.bricks ?? []) {              //For each brick in the current row
                if (!brick2.isSelected &&                                                       //If the brick-in-row is colliding with this brick
                    engine.math.col1D(
                    tposx, tposx + brick1.width,
                    brick2.gpos.x, brick2.gpos.x + brick2.width)) {

                    return false;                                                               //Return false for any collision
                }
            }

            //Check collision between current selected brick and every brick in its potential adjacent rows.
            for (var dir of [-1, 1]) {                                                          //For each direction

                //If row in the direction (above/below) has bricks, check each brick
                for (var brick2 of this.rows.find(r => r.row == tposy + dir)?.bricks ?? []) {   //For each brick in the row in that direction
                    if (!brick2.isSelected &&                                                   //If the brick-in-row is colliding with this brick
                        engine.math.col1D(
                        tposx, tposx + brick1.width,
                        brick2.gpos.x, brick2.gpos.x + brick2.width)) {
        
                        adjacents[dir] = true;                                                  //Set adjacency state for this direction.
                        break;                                                                  //Break to check other direction.
                    }
                }
            }
        }

        //We need to attatch in one direction but not both. Return true if we are attatching in a single direction.
        return adjacents[-1] != adjacents[1];   //If adjacency states are different, return true
    },

    //Set snapped state of selected bricks
    setSnappedBricks : function(state) {
        this.bricks.filter(b => b.isSelected == true).forEach(b => b.snap(state));  //For each selected brick, set its snap to the given state
    },

    //Deselect all bricks
    deselectBricks : function() {

        this.selectedBrick = null;                              //Clear selected brick
        this.selections = [];                                   //Clear selected bricks
        this.bricks.forEach(b => b.deselect());                 //Clear selected status for each brick

        //Move bricks to the new row
        this.rows.forEach(r => {                                //For each row
            var move = r.bricks.filter(b => b.gpos.y != r.row); //Get move-bricks that are no longer in this row
            r.bricks = r.bricks.filter(b => b.gpos.y == r.row); //Remove bricks that are no longer in this row
            move.forEach(b => this.addBrickToRows(b));          //For each move-brick, add it to its new row
        });

        //Sort
        this.sortRows();
    },

    //Add a brick to a row, and create that row if it doesn't exist.
    addBrickToRows : function(brick) {

        var curr = this.rows.find(r => r.row == brick.gpos.y)   //Get current row

        //Create a new row or add a brick to the existing row
        if(curr == null) {                                      //If current row does not exist, create a new one.

            //Create a new row
            this.rows.push({                                    //Push the new row
                row : brick.gpos.y,                             //Set new row position to its first brick's position
                bricks : [brick]                                //Assign brick to row
            })
        }
        else {                                                  //If row exists, add bricks to it.

            //Add a brick to the existing row 
            curr.bricks.push(brick);                            //Add brick to current row
        }
    },

    //Sort bricks
    sortRows : function() {

        //Sort rows
        this.rows.sort((a, b) => a.row > b.row);                                //Sort rows by row value

        //Sort bricks in each row
        this.rows.forEach(r => r.bricks.sort((a, b) => a.gpos.x > b.gpos.x));   //Sort bricks by x-position
    },

    //Check all bricks for hover, return hover state
    hoverBricks : function(pos) {
        return this.checkBricks(pos, (b, p) => this.hoverBrick(b, p)) ?? this.states.NONE;  //Check all bricks and return if the first sucessful check is not static
    },

    //Check all bricks for a mouse position and return the result of a function against that brick and position
    checkBricks : function(pos, func) {

        //Front face check
        for (var brick of this.bricks) {        //For each brick

            if (engine.math.colPointRectGrid(   //Front face - if position is over this face
                pos.x,
                pos.y,
                brick.gpos.x,
                brick.gpos.y,
                brick.width)) {

                return func(brick, pos);        //Run function against this brick and return the result.
            }
        }

        //Top and side face check
        for (var brick of this.bricks) {

            if (engine.math.colPointParHGrid(   //Top Face - if position is over this face
                pos.x,
                pos.y,
                brick.gpos.x,
                brick.gpos.y,
                brick.width) ||                 //OR
                engine.math.colPointParVGrid(   //Side Face - if position is over this face
                pos.x,
                pos.y,
                brick.gpos.x,
                brick.gpos.y,
                brick.width)) {

                return func(brick, pos);        //Run function against this brick and return the result.
            }
        }

        //Return null, there is no brick under this position.
        return null;    
    },

    //Press a single brick
    hoverBrick : function(brick, pos) {

        //Do nothing if the two bricks are the same
        if (this.selectedBrick != null &&                                   //If there is a selected brick
            this.selectedBrick.compare(brick)) {                            //If the two bricks are the same

            return this.states.SAME;                                        //Do nothing, return same state.
        }

        this.selectedBrick = brick;                                         //Set current selected brick for later use
        this.selections = [];                                               //Reset selections

        //Check both directions if they're valid (valid == not null)
        for(var dir of [-1, 1]) {                                           //For each direction
            this.selections[dir] = this.recurseBrick(brick, [dir], true);   //Recurse in that direction. Assign result to valid directions.
        }
        this.bricks.forEach(b => b.clearRecursion());                       //Clear recursion states after both recursive direction checks

        return this.selections[-1] && 
            this.selections[1]  ? this.states.INDY :                        //If both selections are valid, return indeterminate state
            this.selections[-1] ? this.states.UP :                          //If upward selection is valid, return up state
            this.selections[1]  ? this.states.DOWN :                        //If dnward selection is valid, return dn state
            this.states.NONE;                                               //No direction is valid. Return no state                              
    },

    //Check all bricks for press, return press state (none, processed, indeterminate) This entire function is bananas.
    pressBricks : function(pos) {

        var validSelections = [                                     //Build an normal array of selections that are not null
            this.selections[-1], 
            this.selections[1]].filter(s => s);

        if(validSelections.length == 1) {                           //If there is a single valid selection, use and auto-process it

            return this.processSelection(validSelections[0], pos);  //Process this selection using bricks in truthy direction, and the position.
        }

        this.selectedBrick.isPressed = true;                        //For the indeterminate state, just press this brick
        return false;                                               //Return falsy for indeterimate state
    },

    //Set bricks to selected based on a provided cursor position
    initSelection : function(pos, dir) {

        return this.processSelection(this.selections[dir], pos);    //Process the selection
    },

    //Process a selection, set all its bricks to a selected state, search for floating bricks, return if bricks were selected
    processSelection : function(selection, pos) {

        //Select bricks
        selection?.forEach(b => b.select(pos));                         //For each brick, set it to selected.

        //Mark all bricks that lead to a grey brick as grounded (not floating).
        if(selection != null) {                                         //If there are selected bricks
            this.bricksGrey.forEach(b => {                              //For each grey brick
                if(!b.isChecked) {                                      //If the grey brick isn't checked (Reduces redundancy)
                    this.recurseBrick(b, [-1, 1], false).forEach(c => { //Recurse in both directions
                        c.isGrounded = true                             //Set each brick in recursion result to grounded
                    })  
                }
            });

            //Select floating bricks and clear recursion states
            this.bricks.forEach(b => {                                  //For each brick
                if(!b.isGrounded) {                                     //If the brick is floating (not grounded)
                    b.select(pos);                                      //Select the floating brick
                }
                b.clearRecursion();                                     //Clear recursion for this brick
            });
        }

        return !!selection;                                             //Return true if there are selected bricks
    },

    //Recursively select bricks.
    recurseBrick : function(brick1, dirs, checkGrey) {

        //Return nothing for greybricks  
        if (checkGrey &&            //If we are checking for grey bricks
            brick1.isGrey) {        //If this brick is grey
            return null;            //Return null
        }

        brick1.isChecked = true;    //This brick has been checked

        var selection = [brick1];   //Current brick is a new brick in the selection

        //For all directions, check adjacent bricks in that direction and recurse for each brick
        for (var dir of dirs) {                                                                     //For direction

            //If row in the direction (above/below) has bricks, check and recurse for each brick
            for (var brick2 of this.rows.find(r => r.row == brick1.gpos.y + dir)?.bricks ?? []) {   //For each brick in the adjacent row for that direction    

                if (!brick2.isChecked &&                                                            //If brick hasn't been checked
                    engine.math.col1D(                                                              //If brick is in contact with the previous brick
                        brick1.gpos.x, brick1.gpos.x + brick1.width, 
                        brick2.gpos.x, brick2.gpos.x + brick2.width)) {

                    //Recursively check the new brick and add the results to the current selection
                    var result = this.recurseBrick(brick2, dirs, checkGrey)                         //Recurse new brick with current directions and checkGrey status

                    if(result) {                                                                    //If the recursion result wasn't null
                        selection = selection.concat(result);                                       //Add recursion result to selection
                    }
                    else {                                                                          //If the recursion result was null
                        return null;                                                                //Return null
                    }
                }
            }
        }

        return selection;   //Return selection
    }
});