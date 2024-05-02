import Engine from "engine/engine";
import BrickHandler from "game/gameobjects/brickhandler";
import Stud from "./gameobjects/stud";
import Button from "./gameobjects/button";
import ButtonScene from "./gameobjects/buttonscene";
import Character from "./gameobjects/character";
import CharacterBinNormal from "./gameobjects/characterbinnormal";
import CharacterBinTall from "./gameobjects/characterbintall";
import CharacterBot from "./gameobjects/characterbot";
import Counter from "./gameobjects/counter";
import Cursor from "./gameobjects/cursor";
import CursorIcon from "./gameobjects/cursoricon";
import FPSCounter from "./gameobjects/fpscounter";
import LevelSequence from "./gameobjects/levelsequence";
import MobileBubble from "./gameobjects/mobilebubble";
import SpriteSet from "./gameobjects/spriteset";
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
import CharacterGearEye from "./gameobjects/charactergeareye";
import CharacterGearFly from "./gameobjects/charactergearfly";
import CharacterGearGround from "./gameobjects/charactergearground";
import CharacterHandler from "./gameobjects/characterhandler";
import ZIndexHandler from "./gameobjects/zindexhandler";
import MobileBeam from "./gameobjects/mobilebeam";
import { TouchStyle } from "engine/modules/settings";
import Board from "./gameobjects/board";
import ButtonHint from "./gameobjects/buttonhint";

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
            ButtonHint,
            ButtonScene,
            Character,
            CharacterBot,
            CharacterBinNormal,
            CharacterBinTall,
            CharacterGearClimb,
            CharacterGearEye,
            CharacterGearFly,
            CharacterGearGround,
            CharacterHandler,
            Counter,
            Cursor,
            CursorIcon,
            FPSCounter,
            LevelSequence,
            MobileBeam,
            MobileBubble,
            Board,
            SpriteSet,
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