//Level sequence game object
var LevelSequence = function(args) { GameObject.call(this, args);

    //Map levels to array of name-level objects
    this.levels = Object.entries(args.levels ?? {}).map(l => ({ //Map entries
        label : l[0],                                           //Level label
        level : l[1]                                            //Level name
    }));
}

//Level sequence prototype
LevelSequence.prototype = 
Object.create(GameObject.prototype);