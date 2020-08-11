//engine
var engine = engine || {};

//Module that handles tags and game objects grouped by tag.
engine.managerTag = (function() {

    var masterGroup = [];   //Master group containing scene groups.
    var TAGLESS_TAG = "tagless"

	//Init
	function init() {

        var masterGroup = [];
    }
    
    //Push a game object to the master group
    function push(gameObject, sceneName) {

        var curr = masterGroup.find(sg => sg.name == sceneName );

        if(curr == null) {

            console.log("New Scene Group : " + sceneName)

            masterGroup.push({
                name : sceneName,
                sceneGroup : [{
                    tag : gameObject.tag,
                    gameObjects : [gameObject]}]
            })
        }
        else {

            console.log("Existing Scene Group : " + sceneName)
            pushGO(gameObject, curr.sceneGroup)
        }
    }

    //Push a game object to the scene group
    function pushGO(gameObject, sceneGroup) {

        gameObject.tag = gameObject.tag || TAGLESS_TAG

        var curr = sceneGroup.find(gos => gos.tag == gameObject.tag);

        if(curr == null) {

            console.log("New game object list created for tag " + gameObject.tag)

            sceneGroup.push({
                tag : gameObject.tag,
                gameObjects : [gameObject]
            })
        }
        else {

            console.log("New game object added to list for tag " + gameObject.tag)
            curr.gameObjects.push(gameObject)
        }
    }
    
    //Returns the mouse position
    function get(tag, sceneName) {

        return masterGroup.find(sg => {

            return sg.name == sceneName;
        }).sceneGroup.find(gos => {

            return gos.tag == tag
        }).gameObjects;
    }

	//Init
	function clear(sceneName) {

        masterGroup = masterGroup.filter(sg => sg != sceneName);
    }
    
	//Return
	return {
        init : init,
        push : push,
        get : get,
        clear : clear,
    }
    
}());