//engine
var engine = engine || {};

//Module that handles.
engine.managerTag = (function() {

    var masterArray = [];

	//Init
	function init()
	{

    }
    
    //Push a game object to the master array
    function push(gameObject)
    {
        if(gameObject.tag == null)
        {
            console.log("Game object does not have tag.")
            return;
        }

        var curr = masterArray.find(gos =>
        {
            return gos.tag == gameObject.tag
        })

        if(curr == null)
        {
            console.log("New game object list created for tag " + gameObject.tag)

            masterArray.push({
                tag : gameObject.tag,
                gameObjects : [gameObject]
            })
        }
        else
        {
            console.log("New game object added to list for tag " + gameObject.tag)
            curr.gameObjects.push(gameObject)
        }
    }
    
    //Returns the mouse position
    function get(tag)
    {
        return masterArray.find(gos =>
        {
            gos.tag = gameObject.tag
        }).gameObjects;
    }

    //Clear the current list of game objects
    function clear()
    {
        var masterArray = [];
    }
    
	//Return
	return {
        init : init,
        push : push,
        get : get,
        clear : clear,
    }
    
}());