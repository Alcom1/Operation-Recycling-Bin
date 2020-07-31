//engine
var engine = engine || {}

//Engine core
engine.core = (function() {
	var WIDTH = 650, 				// Canvas width (set to default)
		HEIGHT = 420,				// Canvas height (set to default)
		canvas = undefined,			// Canvas
		ctx = undefined,			// Canvas context
		lastTime = 0, 				// used by calculateDeltaTime() 
		debug = true,				// debug
		showCol = false,			// show collisions
		animationID = 0, 			// ID index of the current frame
		gameObjects = [],
		nextScene = { sceneName : ""};
		
	//Initialization
	function init(element, sceneName, width, height) {

		// init canvas
		canvas = element;
		canvas.width = width || WIDTH;
		canvas.height = height || HEIGHT;
		ctx = canvas.getContext('2d');
		
		// canvas actions
		canvas.onmousemove = engine.managerMouse.update.bind(this);

		// load the first scene
		loadScene(sceneName);
		
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

		//Check for and load new scene
		loadScene(nextScene.sceneName)
		
		//Update
		update(dt);
		
		//Draw
		draw(ctx);
		
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

        for(var i = 0; i < gameObjects.length; i++) {
        
            gameObjects[i].update(dt, null);
        }
	}
		
	//Draw the main scene
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

	//Clear
	function clear() {
		gameObjects = [];
	}

	//Push initial Game Object without sorting it.
	function push(gameObject) {
		
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
		
	//start loading a scene
	function loadScene(sceneName) {
		
		if(!sceneName) { return; }

		var xhr = new XMLHttpRequest();
		xhr.overrideMimeType("application/json");
		xhr.open('GET', sceneName, true);
		xhr.onload = loadSceneCallback;
		xhr.send();
	}

	//callback function for when scene data is loaded.
	function loadSceneCallback(e) {
		clear();					//Clear all existing game objects
		engine.managerTag.init();	//Clear all tags

		JSON.parse(e.currentTarget.responseText).gameObjects.forEach(function(o) {
			var go = new window[o.name](o.params || {}, nextScene);
			push(go);
			engine.managerTag.push(go);
		});

		sort();	//Sort all new game objects.
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
		init : init
	}
}());

