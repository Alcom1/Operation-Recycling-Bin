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
    this.bricks.forEach(b => b.isSelected = false);
}

//Reselect all bricks (Set all bricks to a state for reselection)
BrickHandler.prototype.reselectBricks = function() {

    this.bricks.forEach(b => b.isSelected = false);
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
            this.selectedBrick.isSelected = true;   //Set brick to selected
            return this.selectedBrick;              //Return selected brick
        }
    }

    return null;    //No selected bricks
}

//Set bricks to selected based on a provided cursor position
BrickHandler.prototype.selectBricks = function(pos, dir) {

    //if there is currently a selected brick
    if (this.selectedBrick != null) {

        var selection = this.recurseBrick(this.selectedBrick, dir);
        selection?.forEach(b => b.isSelected = true);

        if(selection != null) {
            this.bricksGrey.forEach(b => this.recurseAnti(b).forEach(c => c.isAnti = true));
        }

        this.bricks.forEach(b => {
            if(!b.isAnti && selection != null) {
                b.isSelected = true;
            }
            b.isChecked = false;
            b.isAnti = false;
        });
    }
}

//Recursively select bricks.
BrickHandler.prototype.recurseBrick = function(brick1, dir) {
    if (brick1.isGrey) { return null; } //Return nothing if this is a grey brick or is stopping recursion.

    brick1.isChecked = true;            //This brick has been checked

    var selection = [brick1];           //Current brick is a new brick in the selection

    //If row in the direction (above/below) has bricks, check each brick
    for (var brick2 of this.rows.find(r => r.row == brick1.gpos.y + dir)?.bricks ?? []) {

        if (!brick2.isChecked &&        //If brick hasn't been checked
            engine.math.col1D(          //If brick is in contact with the previous brick
            brick1.gpos.x, brick1.gpos.x + brick1.width, 
            brick2.gpos.x, brick2.gpos.x + brick2.width)) {

            //Recursively check the new brick and add the results to the current selection of new bricks
            var rr = this.recurseBrick(brick2, dir)

            if(rr) {
                selection = selection.concat(rr);
            }
            else {
                return null;
            }
        }
    }

    return selection;   //Return all new bricks
}

//Recursively select bricks.
BrickHandler.prototype.recurseAnti = function(brick1) {

    brick1.isChecked = true;            //This brick has been checked

    var selection = [brick1];           //Current brick is a new brick in the selection
    //For directions
    for (var dir of [-1, 1]) {

        //If row in the direction (above/below) has bricks, check each brick
        for (var brick2 of this.rows.find(r => r.row == brick1.gpos.y + dir)?.bricks ?? []) {

            if (!brick2.isChecked &&        //If brick hasn't been checked
                engine.math.col1D(          //If brick is in contact with the previous brick
                brick1.gpos.x, brick1.gpos.x + brick1.width, 
                brick2.gpos.x, brick2.gpos.x + brick2.width)) {

                //Recursively check the new brick and add the results to the current selection of new bricks
                var rr = this.recurseAnti(brick2, dir)

                if(rr) {
                    selection = selection.concat(rr);
                }
                else {
                    return null;
                }
            }
        }
    }

    return selection;   //Return all new bricks
}