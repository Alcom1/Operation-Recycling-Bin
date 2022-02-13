import Engine from "engine/engine";
import BrickHandler from "game/gameobjects/brickhandler";
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
import BrickPlateHot from "./gameobjects/brickplatehot";
import BrickPlateFan from "./gameobjects/brickplatefan";
import BrickSuper from "./gameobjects/bricksuper";
import BrickPipe from "./gameobjects/brickpipe";
import BrickJump from "./gameobjects/brickjump";
import BrickHandlerDebug from "./gameobjects/brickhandlerdebug";
import BrickJumpMove from "./gameobjects/brickjumpmove";
import BrickPlateButton from "./gameobjects/brickplatebutton";
import CharacterRBG from "./gameobjects/characterrbg";
import CharacterRBC from "./gameobjects/characterrbc";

//Load
window.onload = function() {
    const canvas = document.querySelector('canvas');
    if (!canvas) throw new Error("Can't get canvas");
    
    new Engine(
        canvas, 
        "assets/scenes/",
        "scenes",
        ["LevelInterface", "LEVEL_20"],
        [
            BrickHandler,
            BrickHandlerDebug,
            BrickJump,
            BrickJumpMove,
            BrickNormal,
            BrickPipe,
            BrickPlateButton,
            BrickPlateFan,
            BrickPlateHot,
            BrickSuper,
            Button,
            ButtonScene,
            Character,
            CharacterBot,
            CharacterBin,
            CharacterRBC,
            CharacterRBG,
            Counter,
            Cursor,
            CursorIcon,
            FPSCounter,
            MobileIndicator,
            LevelSequence,
            Sprite,
            Stud
        ],
        false
    );    
}