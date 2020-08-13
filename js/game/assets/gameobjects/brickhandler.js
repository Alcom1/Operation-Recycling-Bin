//BrickHandler object
var BrickHandler = function(args) { GameObject.call(this, args);
    this.rows = [];
    this.bricks = [];
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

BrickHandler.prototype.getAdjacent = function(pos) {

    for (var row of this.rows) {

        for (var brick of row.bricks) {

            if(engine.math.colPointRectGrid(
                pos.x,
                pos.y,
                brick.gpos.x,
                brick.gpos.y,
                brick.width,
                1)) {

                var ret = this.recurseBrick(brick, true);
                this.bricks.forEach(b => b.isChecked = false);  //Uncheck all bricks before returning
                return ret ?? [];
            }
        }
    }

    return [];
}

BrickHandler.prototype.recurseBrick = function(brick, isBase) {
    if (brick.isGrey) { return null }
    brick.isChecked = true;

    var newBricks = [brick]

    var upper = this.rows.find(r => r.row == brick.gpos.y - 1)?.bricks ?? [];
    var lower = this.rows.find(r => r.row == brick.gpos.y + 1)?.bricks ?? [];

    for (var brick2 of upper.concat(lower)) {

        if (!brick2.isChecked &&
            engine.math.col1D(
            brick.gpos.x, 
            brick.gpos.x + brick.width, 
            brick2.gpos.x, 
            brick2.gpos.x + brick2.width)) {

            var rr = this.recurseBrick(brick2, false);

            if(rr || isBase) { 
                
                newBricks = newBricks.concat(rr ?? []);
            }
            else {
                
                return null;
            }
        }
    }
    
    return newBricks;
}