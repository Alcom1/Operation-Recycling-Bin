import Engine from "engine/engine";
import Brick from "game/gameobjects/brick";
import BrickHandler from "game/gameobjects/brickhandler";
import BrickStud from "./gameobjects/brickstud";
import Button from "./gameobjects/button";
import ButtonScene from "./gameobjects/buttonscene";
import Character from "./gameobjects/character";
import CharacterBin from "./gameobjects/characterbin";
import CharacterBot from "./gameobjects/characterbot";
import CharacterHandler from "./gameobjects/characterhandler";
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
        ["loading"],
        [
            Brick,
            BrickHandler,
            BrickStud,
            Button,
            ButtonScene,
            Character,
            CharacterBot,
            CharacterBin,
            CharacterHandler,
            Cursor,
            CursorIcon,
            FPSCounter,
            LevelSequence,
            Sprite
        ]
    );    
}