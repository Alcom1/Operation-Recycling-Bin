//Load
window.onload = function() {

    //Secondary modules
    engine.baker.init(document.querySelector('canvas'));
    engine.mouse.init(document.querySelector('canvas'));

    //Primary module
    engine.core.init(
        document.querySelector('canvas'), 
        "js/game/assets/scenes/",
        ["level_interface", "level_4"]);
}