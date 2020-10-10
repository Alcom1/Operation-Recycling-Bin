//FPS counter game object
var ButtonScene = function(args) { Button.call(this, args);

    this.sceneName = null;  //The name of the scene this button loads
}

//FPS counter prototype
ButtonScene.prototype = 
Object.create(Button.prototype);
Object.assign(ButtonScene.prototype, {

    //Initialize a game object after its scene is loaded.
    init : function(ctx, scenes) { Button.prototype.init.call(this, ctx, scenes);
        
        var levelSequence = engine.tag.get("LevelSequence", "Level")[0];    //Get level sequence for the current level

        //If the current level has a sequence, get the level in the sequence that matches this button's name
        if(levelSequence) {                                                 //If the level has a sequence

            //Get level in the sequence that matches this button's name
            this.sceneName = levelSequence.levels.find(l => l.label === this.text.split(' ').join(''))?.level;  //Get level
        }
    },

    //Button action
    doButtonAction : function() {

        //Go to new scene if this button has a scene name
        if(this.sceneName) {                            //If this button has a scene name

            engine.core.killAllScenes();                //Set all scenes to be unloaded
            engine.core.pushScenes(this.sceneName);     //Push this button's scene name to be loaded
            engine.core.pushScenes("level_interface");  //Push level interface to be loaded
        }
    },
});