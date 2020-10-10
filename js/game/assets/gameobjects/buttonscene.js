//FPS counter game object
var ButtonScene = function(args) { Button.call(this, args);

    this.sceneName = args.sceneName
}

//FPS counter prototype
ButtonScene.prototype = 
Object.create(Button.prototype);
Object.assign(ButtonScene.prototype, {

    //Button action
    doButtonAction : function() {

        engine.core.killAllScenes();
        engine.core.pushScenes(this.sceneName);
        engine.core.pushScenes("level_interface");
    },
});