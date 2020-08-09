//Load
window.onload = function() {

	//Main
	engine.managerTag.init();
	engine.managerMouse.init(
		document.querySelector('canvas'));
	engine.core.init(
		document.querySelector('canvas'), 
		"js/game/assets/scenes/",
		"scene_0");
}