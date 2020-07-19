//engine
var engine = engine || {};

//Main object literal
engine.main = (function() {
	var WIDTH = 650, 				// Canvas width (set to default)
		HEIGHT = 420,				// Canvas height (set to default)
		canvas = undefined,			// Canvas
		ctx = undefined,			// Canvas context
		lastTime = 0, 				// used by calculateDeltaTime() 
		debug = true,				// debug
		showCol = false,			// show collisions
		animationID = 0,			// ID index of the current frame.
		scene = new Scene(),		// Current scene
		indexS = -1;				// Index of the current scene
		
	//Initialization
	function init(element, sceneName, width, height) {

		//Init log
		console.log("app.main.init() called");
		
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
	};
		
	//Core update
	function frame() {
		
		//LOOP
		animationID = requestAnimationFrame(frame.bind(this));
			
		//Calculate Delta Time of frame
		var dt = calculateDeltaTime();
		
		//Clear
		ctx.clearRect(0, 0, WIDTH, HEIGHT);

		//Check for and load new scene
		if(scene.newScene) {
			loadScene(scene.newScene);
			scene.newScene = "";
		}
		
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
	};
		
	//Update logic
	function update(dt) {
		
		scene.update(dt);
	};
		
	//Draw the main scene
	function draw(ctx) {
		
		scene.draw(ctx);
	};
		
	//Load a scene
	function loadScene(sceneName) {
		
		var newScene = loadJson(sceneName);
		
		scene.clear();
		scene.init();

		newScene.gameObjects.forEach(function(o) {
			callObject(o.name, o.params || {});
		});

		scene.sortGO();	//Sort all new game objects.
	};

	//XMLHttpRequest methods
	function loadJson(fileName) {

		var xhr = new XMLHttpRequest();
		xhr.overrideMimeType("application/json");
		xhr.open('GET', fileName, false);
		xhr.send();
		return JSON.parse(xhr.responseText);
	}

	//Instantiate object by name and args.
	function callObject(name, args) {

		var gameObject = new window[name](args);

		scene.pushGOinit(gameObject);
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
	};
		
	//Calculate delta-time
	function calculateDeltaTime() {
		
		var now, fps;
		now = (+new Date); 
		fps = 1000 / (now - lastTime);
		fps = clamp(fps, 12, 240);
		lastTime = now; 
		return 1/fps;
	};

	return {
		init : init
	}
}());

