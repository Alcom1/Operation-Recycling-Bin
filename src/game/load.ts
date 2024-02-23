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
import MobileBubble from "./gameobjects/mobilebubble";
import Sprite from "./gameobjects/sprite";
import Backdrop from "./gameobjects/backdrop";
import BrickNormal from "game/gameobjects/bricknormal";
import BrickTileHot from "./gameobjects/bricktilehot";
import BrickTileFan from "./gameobjects/bricktilefan";
import BrickSuper from "./gameobjects/bricksuper";
import BrickPipe from "./gameobjects/brickpipe";
import BrickJump from "./gameobjects/brickjump";
import BrickHandlerDebug from "./gameobjects/brickhandlerdebug";
import BrickJumpMove from "./gameobjects/brickjumpmove";
import BrickTileButton from "./gameobjects/bricktilebutton";
import CharacterGearClimb from "./gameobjects/charactergearclimb";
import CharacterGearGround from "./gameobjects/charactergearground";
import CharacterHandler from "./gameobjects/characterhandler";
import ZIndexHandler from "./gameobjects/zindexhandler";
import { TouchStyle } from "engine/modules/settings";
import MobileBeam from "./gameobjects/mobilebeam";

// Load
window.onload = function() {
    const canvas = document.querySelector('canvas');
    if (!canvas) throw new Error("Can't get canvas");
    
    new Engine(
        canvas, 
        "scenes/",
        "scenes",
        ["LevelInterface", "LEVEL_01"],
        [
            Backdrop,
            BrickHandler,
            BrickHandlerDebug,
            BrickJump,
            BrickJumpMove,
            BrickNormal,
            BrickPipe,
            BrickTileButton,
            BrickTileFan,
            BrickTileHot,
            BrickSuper,
            Button,
            ButtonScene,
            Character,
            CharacterBot,
            CharacterBin,
            CharacterGearClimb,
            CharacterGearGround,
            CharacterHandler,
            Counter,
            Cursor,
            CursorIcon,
            FPSCounter,
            LevelSequence,
            MobileBeam,
            MobileBubble,
            Sprite,
            Stud,
            ZIndexHandler
        ],
        [
            ["touchStyle", TouchStyle.PUSH],
            ["touchDragIs1D", true]
        ],
        false
    );
}