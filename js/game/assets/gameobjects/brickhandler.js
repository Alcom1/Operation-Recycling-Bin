//BrickHandler object
var BrickHandler = function(args) { GameObject.call(this, args);
    this.rows = [];
}

BrickHandler.prototype = Object.create(GameObject.prototype);

//Initialize a game object after its scene is loaded.
BrickHandler.prototype.init = function() {

    //Divide bricks into rows
    engine.managerTag.get("Brick", "GameScene").forEach(b => {

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