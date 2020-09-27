//engine
var engine = engine || {}

//Engine core
engine.core = (function() {
    
    var WIDTH =             1296,       //Canvas width (set to default)
        HEIGHT =            864,        //Canvas height (set to default)
        scenePath =         "",         //Path scenes are located in
        canvas =            undefined,  //Canvas
        ctx =               undefined,	//Canvas context
        lastTime =          0,          //used by calculateDeltaTime() 
        animationID =       0,          //ID index of the current frame
        scenes =            [],         //Array of current scenes
        pushSceneNames =    [],         //Array of names of scenes to be added
        killSceneNames =	[]          //Array of names of scenes to be removed

    //Initialization
    function init(element, scenePathName, startScenes, width, height) {

        //Scene path
        scenePath = scenePathName                                   //Store path for scenes

        //init canvas
        canvas = element;                                           //Canvas element
        canvas.width = (width || WIDTH);                            //Canvas width
        canvas.height = (height || HEIGHT);                         //Canvas height
        canvas.style.maxWidth = canvas.width + "px";                //Canvas width max
        canvas.style.maxHeight = canvas.height + "px";              //Canvas height max
        ctx = canvas.getContext('2d');                              //Canvas 2D context

        //Set the resolution for the mouse space
        engine.mouse.setResolution(canvas.width, canvas.height);    //Mouse space is the height and width of the canvas

        //Load the starting scenes
        startScenes.forEach(s => loadScene(s));                     //For each starting scene, load it
        
        //Start the game loop
        frame();
    }
        
    //Core update
    function frame() {
        
        //LOOP
        animationID = requestAnimationFrame(frame.bind(this));  //Magic
            
        //Setup frame
        var dt = calculateDeltaTime();                          //Calculate delta time, time since last frame
        ctx.clearRect(0, 0, WIDTH, HEIGHT);                     //Clear the canvas

        //Load and Unload scenes
        pushSceneNames.forEach(sn => loadScene(sn));            //Load each scene name in the push list
        pushSceneNames = [];                                    //Reset push list
        unloadScenes(killSceneNames);

        //Scene actions
        initScenes();                                           //Initialize scenes that haven't been initialized yet.
        updateScenes(dt);                                       //Update scenes with current deltatime.
        drawScenes();                                           //Draw scenes.

        //Module updates
        engine.mouse.update();                                  //Update mouse status for per-frame events
    }

    //Scenes - Initialize
    function initScenes() {
        
        //Initialize scenes
        scenes.forEach(s => s.init(ctx, scenes));   //For each scene, initialize it
    }
        
    //Scenes - Updates
    function updateScenes(dt) {

        //Update scenes
        scenes.forEach(s => s.update(dt));          //For each scene, update it
    }
        
    //Scenes - Draw
    function drawScenes() {

        //Draw scenes
        scenes.forEach(s => s.draw(ctx));           //For each scene, draw it
    }

    //Scenes - Sort
    function sortScenes() {

        //Sort scenes by z-index.
        scenes.sort((a, b) => a.zIndex - b.zIndex); //Scenes are ordered by their z-index
    }
        
    //start loading a scene
    function loadScene(sceneName) {

        var xhr = new XMLHttpRequest();                         //HTTP Request
        xhr.overrideMimeType("application/json");               //Request JSON
        xhr.open('GET', scenePath + sceneName + ".json", true); //Build scene path and request
        xhr.onload = loadSceneCallback;                         //Callback function to build scene from JSON
        xhr.send();
    }

    //callback function for when scene data is loaded.
    function loadSceneCallback(e) {
        var sceneData = JSON.parse(e.currentTarget.responseText);   //Parse scene data from response text
        var scene = new Scene(sceneData.scene);                     //Build scene from data

        sceneData.gameObjects.forEach(o => {                        //For each game object
            var go = new window[o.name]({...o, scene});             //Construct the object from its name. Pass parameters and scene to constructor
            scene.pushGO(go);                                       //Add object to scene
            engine.tag.pushGO(go, scene.name);                      //Add object to tags
        });

        scene.sortGO();                                             //Sort all new game objects
        scenes.push(scene);                                         //Add scene to scenes
        sortScenes();                                               //Sort scenes with new scene
    }

    //unload a scene
    function unloadScenes() {

        //If there are scenes in the kill list, unload them and reset kill list
        if(killSceneNames.length > 1) {                                     //If there are scenes in the kill list

            scenes = scenes.filter(s => !killSceneNames.includes(s.name));  //Clear scene names from core
            killSceneNames.forEach(n => engine.tag.clear(n));               //Clear scene names from tags
            killSceneNames = [];                                            //Scenes have been cleared, reset kill list
        }
    }
    
    //set scene fileNames to be loaded
    function pushScenes(fileNames) {

        //Push singular or multiple file names
        if(Array.isArray(fileNames))                //If there are multiple file names
        {
            fileNames.forEach(s => pushScene(s))    //Push each file name
        }
        else
        {
            pushScene(fileNames)                    //Push singular file name
        }
    }
    
    //set scenes to be unloaded
    function killScenes(sceneNames) {

        //Kil singular or multiple scene names
        if(Array.isArray(sceneNames))               //If there are multiple scene names
        {
            sceneNames.forEach(s => killScene(s))   //Push each scene name
        }
        else
        {
            killScene(sceneNames)                   //Push singular scene name
        }
    }
    
    //set a scene file name to be loaded
    function pushScene(fileName) {

        if(!pushSceneNames.includes(fileName))  //Prevent duplicates on the push list 
        {
            pushSceneNames.push(fileName);      //Add file name to list of scene names to be loaded
        }
    }
    
    //set a scene to be unloaded
    function killScene(sceneName) {

        if(!killSceneNames.includes(sceneName)) //Prevent duplicates on the kill list 
        {
            killSceneNames.push(sceneName);     //Add file name to list of scene names to be unloaded
        }
    }
        
    //Calculate delta-time
    function calculateDeltaTime() {
        
        var now = (+new Date);                                          //Date as milliseconds
        var fps = engine.math.clamp(1000 / (now - lastTime), 12, 240);  //Frames per second, limited between 12 and 240
        lastTime = now;                                                 //Record timestamp for next frame
        return 1/fps;       //Return delta time, the milliseconds between this frame and the previous frame
    }

    return {
        init,
        pushScenes,
        killScenes,
    }
}());

