import Engine from "engine/engine";
import Brick from "game/gameobjects/brick";
import BrickHandler from "game/gameobjects/brickhandler";
import BrickStud from "./gameobjects/brickstud";
import Button from "./gameobjects/button";
import ButtonScene from "./gameobjects/buttonscene";
import Cursor from "./gameobjects/cursor";
import CursorIcon from "./gameobjects/cursoricon";
import FPSCounter from "./gameobjects/fpscounter";
import LevelSequence from "./gameobjects/levelsequence";
import Sprite from "./gameobjects/sprite";

//Load
window.onload = function() {
    const canvas = document.querySelector('canvas');
    if (!canvas) throw new Error("Can't get canvas");
    
    new Engine(
        canvas, 
        "assets/scenes/",
        ["level_interface", "level_1"],
        [
            Brick,
            BrickHandler,
            BrickStud,
            Button,
            ButtonScene,
            Cursor,
            CursorIcon,
            FPSCounter,
            LevelSequence,
            Sprite
        ]
    );    
}