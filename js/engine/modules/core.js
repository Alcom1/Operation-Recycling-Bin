//engine
var engine = engine || {}

//Engine core
engine.core = (function() {
	var WIDTH = 650, 				// Canvas width (set to default)
		HEIGHT = 420,				// Canvas height (set to default)
		scenePath = "",				// Path scenes are located in
		canvas = undefined,			// Canvas
		ctx = undefined,			// Canvas context
		lastTime = 0, 				// used by calculateDeltaTime() 
		debug = true,				// debug
		animationID = 0, 			// ID index of the current frame
		scenes = [],
		pushSceneNames = [],
		killSceneNames = []

	//Initialization
	function init(element, scenePathName, startScene, width, height) {

		//Scene path
		scenePath = scenePathName

		// init canvas
		canvas = element;
		canvas.width = width || WIDTH;
		canvas.height = height || HEIGHT;
		ctx = canvas.getContext('2d');
		
		// canvas actions
		canvas.onmousemove = engine.managerMouse.updatePos.bind(this);

		// load the first scene
		loadScene(startScene);
		
		// start the game loop
		frame();
	}
		
	//Core update
	function frame() {
		
		//LOOP
		animationID = requestAnimationFrame(frame.bind(this));
			
		//Calculate Delta Time of frame
		var dt = calculateDeltaTime();
		
		//Clear
		ctx.clearRect(0, 0, WIDTH, HEIGHT);

		//Check for and load new scenes
		pushSceneNames.forEach(sn => loadScene(sn));
		pushSceneNames = [];

		//Check for and clear cut scenes
		unLoadScenes(killSceneNames);
		
		//Update
		update(dt);
		
		//Draw
		draw(ctx);

		//Module updates
		engine.managerMouse.update(dt);
		
		//Draw debug info
		if (debug)
		{
			// draw dt in bottom right corner
			fillText(
				"fps: " + (1 / dt).toFixed(1),
				2,
				16,
				"16pt Consolas",
				"white",
				false);
		}
	}
		
	//Update logic
	function update(dt) {

		scenes.forEach(s => s.update(dt));
	}
		
	//Draw the main scene
	function draw(ctx) {

		scenes.forEach(s => s.draw(ctx));
	}

	//Sort Game Objects
	function sort() {

		//Sort scenes by z-index.
		scenes.sort((a, b) => a.zIndex - b.zIndex);
	}
		
	//start loading a scene
	function loadScene(sceneName) {
		
		if(!sceneName) { return; }

		var xhr = new XMLHttpRequest();
		xhr.overrideMimeType("application/json");
		xhr.open('GET', scenePath + sceneName + ".json", true);
		xhr.onload = loadSceneCallback;
		xhr.send();
	}

	//callback function for when scene data is loaded.
	function loadSceneCallback(e) {
		var sceneData = JSON.parse(e.currentTarget.responseText);
		var scene = new Scene(sceneData.scene);

		sceneData.gameObjects.forEach(o => {
			var go = new window[o.name](o || {});
			scene.push(go);
			engine.managerTag.push(go, scene.name);
		});

		scene.sort();		//Sort all new game objects.
		scene.init(ctx);	//Initialize all new objects in scene.
		scenes.push(scene);
		sort();
	}

	//unload a scene
	function unLoadScenes() {

		scenes = scenes.filter(s => !killSceneNames.includes(s.name));
		killSceneNames = [];
	}
	
	//set scene fileNames to be loaded
	function pushScenes(fileNames) {

		if(Array.isArray(fileNames))
		{
			fileNames.forEach(s => pushScene(s))
		}
		else
		{
			pushScene(fileNames)
		}
	}
	
	//set scenes to be unloaded
	function killScenes(sceneNames) {

		if(Array.isArray(sceneNames))
		{
			sceneNames.forEach(s => killScene(s))
		}
		else
		{
			killScene(sceneNames)
		}
	}
	
	//set a scene file name to be loaded
	function pushScene(fileName) {

		if(!pushSceneNames.includes(fileName))
		{
			pushSceneNames.push(fileName);
		}
	}
	
	//set a scene to be unloaded
	function killScene(sceneName) {

		if(!killSceneNames.includes(sceneName))
		{
			killSceneNames.push(sceneName);
		}
	}
		
	//Draw filled text
	function fillText(string, x, y, css, color, centered) {
		
		ctx.save();
		if(centered)
		{
			ctx.textAlign = "center";
			ctx.textBaseline = "middle"; 
		}
		ctx.font = css;
		ctx.fillStyle = color; 
		ctx.fillText(string, x, y);
		ctx.restore();
	}
		
	//Calculate delta-time
	function calculateDeltaTime() {
		
		var now, fps;
		now = (+new Date); 
		fps = 1000 / (now - lastTime);
		fps = engine.math.clamp(fps, 12, 240);
		lastTime = now; 
		return 1/fps;
	}

	return {
		init,
		pushScenes,
		killScenes,
	}
}());

