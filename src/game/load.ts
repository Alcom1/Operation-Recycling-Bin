import Engine from "engine/engine";
import BrickHandler from "game/gameobjects/brickhandler";
import BrickPlate from "./gameobjects/brickplate";
import Stud from "./gameobjects/stud";
import Button from "./gameobjects/button";
import ButtonScene from "./gameobjects/buttonscene";
import Character from "./gameobjects/character";
import CharacterBin from "./gameobjects/characterbin";
import CharacterBot from "./gameobjects/characterbot";
import Counter from "./gameobjects/counter";
import Cursor from "./gameobjects/cursor";
import CursorIcon from "./gameobjects/cursoricon";
import FPSCounter from "./gameobjects/fpscounter";
import LevelSequence from "./gameobjects/levelsequence";
import MobileIndicator from "./gameobjects/mobileindicator";
import Sprite from "./gameobjects/sprite";
import BrickNormal from "game/gameobjects/bricknormal";

//Load
window.onload = function() {
    const canvas = document.querySelector('canvas');
    if (!canvas) throw new Error("Can't get canvas");
    
    new Engine(
        canvas, 
        "assets/scenes/",
        "scenes",
        ["LevelInterface", "LEVEL_44"],
        [
            BrickHandler,
            BrickPlate,
            BrickNormal,
            Button,
            ButtonScene,
            Character,
            CharacterBot,
            CharacterBin,
            Counter,
            Cursor,
            CursorIcon,
            FPSCounter,
            MobileIndicator,
            LevelSequence,
            Sprite,
            Stud
        ]
    );    
}