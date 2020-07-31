//engine
var engine = engine || {};

//Main object literal
engine.scene = (function() {

    var gameObjects = [];
    var nextSceneName = "";

    //Clear
    function init() {
        gameObjects = [];
    }

    //Push Game Object
    function push(gameObject) {
        
        pushinit(gameObject);
        sort(gameObject);
    }

    //Push initial Game Object without sorting it.
    function pushinit(gameObject) {
        
        gameObjects.push(gameObject);
    }

    //Sort Game Objects
    function sort()
    {
        //Sort game objects by z-index.
        gameObjects.sort(
            function(a, b) {
        
                if(a.zIndex == b.zIndex)
                    return 0;
                
                return a.zIndex > b.zIndex;
            });
    }

    //Set next scene
    function setNextScene(newNextSceneName)
    {
        nextSceneName = newNextSceneName;
    }

    //Get and reset next scene name
    function getNextScene()
    {
        var nextSceneTemp = nextSceneName;
        nextSceneName = "";
        return nextSceneTemp;
    }

    //Scene update
    function update(dt) {
        
        for(var i = 0; i < gameObjects.length; i++) {
        
            gameObjects[i].update(dt, null);
        }
    }

    //Scene draw
    function draw(ctx) {
        
        for(var i = 0; i < gameObjects.length; i++) {
            var gameObject = gameObjects[i];
            ctx.save();
                ctx.translate(
                    gameObject.gpos.x * 15 + gameObject.spos.x, 
                    gameObject.gpos.y * 18 + gameObject.spos.y);
                gameObject.draw(ctx);
            ctx.restore();
        }
    }

	return {
        init : init,
        push : push,
        pushinit : pushinit,
        sort : sort,
        setNextScene : setNextScene,
        getNextScene : getNextScene,
        update : update,
        draw : draw,
	}
}());