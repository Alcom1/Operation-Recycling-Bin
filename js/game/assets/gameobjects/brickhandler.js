//BrickHandler object
var BrickHandler = function(args) { GameObject.call(this, args);
    this.rows = [];
    this.bricks = [];
    this.count = 0;
}

BrickHandler.prototype = Object.create(GameObject.prototype);

//Initialize a game object after its scene is loaded.
BrickHandler.prototype.init = function() {

    //Establish bricks
    this.bricks = engine.managerTag.get("Brick", "GameScene")

    //Divide bricks into rows
    this.bricks.forEach(b => {

        var curr = this.rows.find(r => r.row == b.gpos.y)

        if(curr == null) {

            console.log("New Brick Row : " + b.gpos.y)

            this.rows.push({

                row : b.gpos.y,
                bricks : [b]
            })
        }
        else {

            console.log("Existing Brick Row : " + b.gpos.y)
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

    this.bricks.forEach(b => b.isSelected = false);
}

//Set bricks to selected based on a provided cursor position
BrickHandler.prototype.selectBricks = function(pos, dir) {

    for (var row of this.rows) {

        for (var brick of row.bricks) {

            if(engine.math.colPointRectGrid(
                pos.x,
                pos.y,
                brick.gpos.x,
                brick.gpos.y,
                brick.width,
                1)) {

                this.count = 0;
                this.bricks.forEach(b => b.number = 0)

                this.recurseBrick(brick, dir)?.forEach(b => b.isSelected = true);
                this.bricks.forEach(b => b.isChecked = false);  //Uncheck all bricks before returning
            }
        }
    }
}

//Recursively select bricks.
BrickHandler.prototype.recurseBrick = function(brick1, dir) {
    brick1.number = this.count++; 
    if (brick1.isGrey) { return null; }

    brick1.isChecked = true;

    var newBricks = [brick1];

    for (var brick2 of this.rows.find(r => r.row == brick1.gpos.y + dir)?.bricks ?? []) {

        if (!brick2.isChecked &&
            engine.math.col1D(
            brick1.gpos.x, brick1.gpos.x + brick1.width, 
            brick2.gpos.x, brick2.gpos.x + brick2.width)) {

            newBricks = newBricks.concat(this.recurseBrick(brick2, dir) ?? []);
        }
    }

    return newBricks;
}