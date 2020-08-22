//BrickHandler object
var BrickHandler = function(args) { GameObject.call(this, args);
    this.rows = [];             //Rows of bricks
    this.bricks = [];           //All bricks
    this.brcickSelected = null; //Current selected brick
    this.count = 0;             //Counter for ordering selected bricks
}

BrickHandler.prototype = Object.create(GameObject.prototype);

//Initialize a game object after its scene is loaded.
BrickHandler.prototype.init = function(ctx) {

    //Establish bricks
    this.bricks = engine.tag.get("Brick", "GameScene")
    this.bricksGrey = this.bricks.filter(b => b.isGrey == true);

    //Divide bricks into rows
    this.bricks.forEach(b => this.addBrick(b));

    //Sort
    this.sortRows();
}

//Check selection collision
BrickHandler.prototype.checkSelectionCollision = function() {

    var adjacents = [];  //Adjacency states, contains if there's a brick in the indexed direction.

    //For each selected brick
    for(var brick1 of this.bricks.filter(b => b.isSelected == true)) {

        //Combine grid positions and sub positions for true positions
        var tposx = brick1.gpos.x + Math.round(brick1.spos.x / engine.math.gmultx);
        var tposy = brick1.gpos.y + Math.round(brick1.spos.y / engine.math.gmulty);

        //Check collision between current selected brick and every brick in its potential new row.
        //If the new row has bricks, check each brick
        for(var brick2 of this.rows.find(r => r.row == tposy)?.bricks ?? []) {
            if (!brick2.isSelected && 
                engine.math.col1D(
                tposx, tposx + brick1.width,
                brick2.gpos.x, brick2.gpos.x + brick2.width)) {

                return false;   //If there is a collision, stop and return false.
            }
        }

        //Check collision between current selected brick and every brick in its potential adjacent rows.
        //For each direction
        for (var dir of [-1, 1]) {

            //If row in the direction (above/below) has bricks, check each brick
            for (var brick2 of this.rows.find(r => r.row == tposy + dir)?.bricks ?? []) {
                if (!brick2.isSelected && 
                    engine.math.col1D(
                    tposx, tposx + brick1.width,
                    brick2.gpos.x, brick2.gpos.x + brick2.width)) {
    
                    adjacents[dir] = true;  //Set adjacency state for this direction.
                    break;
                }
            }
        }
    }

    return adjacents[-1] != adjacents[1];   //If adjacency states are different, return true
}

//Deselect all bricks
BrickHandler.prototype.deselectBricks = function() {

    this.selectedBrick = null;                      //Clear selected brick
    this.bricks.forEach(b => b.deselect());   //Clear selected status

    //Move bricks to the new row
    this.rows.forEach(r => {
        var move = r.bricks.filter(b => b.gpos.y != r.row);
        r.bricks = r.bricks.filter(b => b.gpos.y == r.row);
        move.forEach(b => this.addBrick(b));
    });

    //Sort
    this.sortRows();
}

//Add a brick to the brickhandler
BrickHandler.prototype.addBrick = function(brick) {

    var curr = this.rows.find(r => r.row == brick.gpos.y)   //Get current row

    if(curr == null) {          //If row does not exist, create a new one.

        this.rows.push({

            row : brick.gpos.y,
            bricks : [brick]
        })
    }
    else {                      //If row exists, add bricks to it.

        curr.bricks.push(brick);
    }
}

//Sort bricks
BrickHandler.prototype.sortRows = function() {

    //Sort rows
    this.rows.sort(
        function(a, b) {
            
            return a.row > b.row;
        });

    //Sort bricks in rows
    this.rows.forEach(r => r.bricks.sort(
        function(a, b) {

            return a.gpos.x > b.gpos.x;
        }));
}

//Select a single brick
BrickHandler.prototype.selectSingle = function(pos) {

    //For each brick
    for (var brick of this.bricks) {

        if(engine.math.colPointRectGrid(            //If cursor is over a brick
            pos.x,
            pos.y,
            brick.gpos.x,
            brick.gpos.y,
            brick.width,
            1)) {

            this.selectedBrick = brick;             //Establish current selected brick
            this.selectedBrick.press();             //Set brick to selected
            return this.selectedBrick;              //Return selected brick
        }
    }

    return null;    //No selected bricks
}

//Set bricks to selected based on a provided cursor position
BrickHandler.prototype.selectBricks = function(pos, dir) {

    //if there is currently a selected brick
    if (this.selectedBrick != null) {

        var selection = this.recurseBrick(this.selectedBrick, [dir], true); //Recursively get the initial selection of bricks.
        selection?.forEach(b => b.select(pos));                       //

        //Mark all bricks that lead to a grey brick as grounded (not floating).
        if(selection != null) {
            this.bricksGrey.forEach(b => {  //For each grey brick
                if(!b.isChecked) {          //Don't check checked grey bricks. (Reduces redundancy)
                    this.recurseBrick(b, [-1, 1], false).forEach(c => {
                        c.isGrounded = true
                    })  //Recursively check for grounded bricks.
                }
            });
        }

        //Select floating bricks and clear recursion states
        this.bricks.forEach(b => {
            if(!b.isGrounded && selection != null) {    //If we have a selection and this brick is floating
                b.select(pos);                          //Select the floating brick
            }
            b.clearRecursion();
        });

        return selection != null;   //Return true if we are selecting bricks
    }
    else {
        return false;               //There is no selected brick, return false;
    }
}

//Recursively select bricks.
BrickHandler.prototype.recurseBrick = function(brick1, dirs, checkGrey) {
    if (checkGrey &&            //Return nothing for greybricks  
        brick1.isGrey) {                   
        return null; 
    }

    brick1.isChecked = true;    //This brick has been checked

    var selection = [brick1];   //Current brick is a new brick in the selection

    //For directions
    for (var dir of dirs) {

        //If row in the direction (above/below) has bricks, check each brick
        for (var brick2 of this.rows.find(r => r.row == brick1.gpos.y + dir)?.bricks ?? []) {

            if (!brick2.isChecked &&        //If brick hasn't been checked
                engine.math.col1D(          //If brick is in contact with the previous brick
                brick1.gpos.x, brick1.gpos.x + brick1.width, 
                brick2.gpos.x, brick2.gpos.x + brick2.width)) {

                //Recursively check the new brick and add the results to the current selection
                var rr = this.recurseBrick(brick2, dirs, checkGrey)

                if(rr) {
                    selection = selection.concat(rr);
                }
                else {
                    return null;
                }
            }
        }
    }

    return selection;   //Return selection
}