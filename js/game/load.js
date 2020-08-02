//Load
window.onload = function() {

	//Main
	engine.managerTag.init();
	engine.managerMouse.init();
	engine.core.init(
		document.querySelector('canvas'), 
		"js/game/assets/scenes/",
		"scene_0");
}