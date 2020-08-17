//BrickHandler object
var BrickHandler = function(args) { GameObject.call(this, args);
    this.rows = [];             //Rows of bricks
    this.bricks = [];           //All bricks
    this.brcickSelected = null; //Current selected brick
    this.count = 0;             //Counter for ordering selected bricks
}

BrickHandler.prototype = Object.create(GameObject.prototype);

//Initialize a game object after its scene is loaded.
BrickHandler.prototype.init = function() {

    //Establish bricks
    this.bricks = engine.managerTag.get("Brick", "GameScene")
    this.bricksGrey = this.bricks.filter(b => b.isGrey == true);

    //Divide bricks into rows
    this.bricks.forEach(b => {

        var curr = this.rows.find(r => r.row == b.gpos.y)   //Get current row

        if(curr == null) {          //If row does not exist, create a new one.

            this.rows.push({

                row : b.gpos.y,
                bricks : [b]
            })
        }
        else {                      //If row exists, add bricks to it.

            curr.bricks.push(b);
        }
    });

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

//Deselect all bricks
BrickHandler.prototype.deselectBricks = function() {

    this.selectedBrick = null;
    this.bricks.forEach(b => b.clearSelection());
}

//Reselect all bricks (Set all bricks to a state for reselection)
BrickHandler.prototype.reselectBricks = function() {

    this.bricks.forEach(b => b.clearSelection());
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
            this.selectedBrick.isPressed = true;    //Set brick to selected
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
                    this.recurseBrick(b, [-1, 1], false).forEach(c => c.isGrounded = true)  //Recursively check for grounded bricks.
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