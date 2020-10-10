//engine
var engine = engine || {};

//Module that handles tags and game objects grouped by tag.
engine.tag = (function() {

    var scenes = [];    //Master group containing scenes.

    //Return true if a scene by name exists in the scene.
    function exists(sceneName) {

        return scenes.some(s => s.name == sceneName);  //Return if any scene matches the provided scene name.
    }
    
    //Push a game object to the scene
    function pushGOToScene(gameObject, sceneName) {

        //Get scene with name
        var curr = scenes.find(sg => sg.name == sceneName );    //Current scene that matches the name

        //Store new scene or push gameObject to existing scene  
        if(curr == null) {                                      //If current scene does not exist

            scenes.push({                                       //Store a new scene

                name : sceneName,                               //Scene name
                tags : [{                                       //Scene tags

                    tag : gameObject.tag,                       //Tag name
                    tagObjects : [gameObject]}]                 //Tagged objects, new object goes here
            });
        }
        else {                                                  //If current scene exists

            pushGOToGroup(gameObject, curr.tags);               //Push the game object to that scene
        }
    }

    //Push a game object to the tag
    function pushGOToGroup(gameObject, tags) {

        //Get tag with game object's name
        var curr = tags.find(gos => gos.tag == gameObject.tag); //Current tag that matches the name

        //Store new tag or push gameObject to existing tag
        if(curr == null) {                                      //If current tag does not exist

            tags.push({                                         //Store a new tag

                tag : gameObject.tag,                           //Tag name
                tagObjects : [gameObject]                       //Tagged objects, new object goes here
            })
        }
        else {                                                  //If current tag exists
            
            curr.tagObjects.push(gameObject);                   //Push the game object to that tag
        }
    }
    
    //Returns all game objects for the given tag and scene name
    function get(tag, sceneName) {

        return scenes.find(sg => {          //Go into scene with name

            return sg.name == sceneName;    //Match scene name
        }).tags.find(gos => {               //Go into tag with name

            return gos.tag == tag;          //Match tag name
        }).tagObjects;                      //Return game objects for scene and tag
    }

    //Remove scenes with names in the provided list
    function clear(sceneNames) {

        scenes = scenes.filter(sg => !sceneNames.some(sn => sg.name == sn));    //Remove scenes by name
    }
    
    //Return
    return {
        exists,
        pushGO : pushGOToScene,
        get,
        clear,
    }
    
}());