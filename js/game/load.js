//Load
window.onload = function() {

    //Secondary modules
    engine.baker.init(document.querySelector('canvas'));
    engine.mouse.init(document.querySelector('canvas'));
    engine.tag.init();

    //Primary module
    engine.core.init(
        document.querySelector('canvas'), 
        "js/game/assets/scenes/",
        ["level_interface", "level_2"]);
}