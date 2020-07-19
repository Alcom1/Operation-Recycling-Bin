//Load
window.onload = function() {

	//Main
	engine.managerMouse.init();
	engine.main.init(document.querySelector('canvas'), "js/game/assets/scenes/scene_0.json");
}