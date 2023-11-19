import Engine from "../engine/engine.js";
import BrickHandler from "./gameobjects/brickhandler.js";
import Stud from "./gameobjects/stud.js";
import Button from "./gameobjects/button.js";
import ButtonScene from "./gameobjects/buttonscene.js";
import Character from "./gameobjects/character.js";
import CharacterBin from "./gameobjects/characterbin.js";
import CharacterBot from "./gameobjects/characterbot.js";
import Counter from "./gameobjects/counter.js";
import Cursor from "./gameobjects/cursor.js";
import CursorIcon from "./gameobjects/cursoricon.js";
import FPSCounter from "./gameobjects/fpscounter.js";
import LevelSequence from "./gameobjects/levelsequence.js";
import MobileIndicator from "./gameobjects/mobileindicator.js";
import Sprite from "./gameobjects/sprite.js";
import BrickNormal from "./gameobjects/bricknormal.js";
import BrickTileHot from "./gameobjects/bricktilehot.js";
import BrickTileFan from "./gameobjects/bricktilefan.js";
import BrickSuper from "./gameobjects/bricksuper.js";
import BrickPipe from "./gameobjects/brickpipe.js";
import BrickJump from "./gameobjects/brickjump.js";
import BrickHandlerDebug from "./gameobjects/brickhandlerdebug.js";
import BrickJumpMove from "./gameobjects/brickjumpmove.js";
import BrickTileButton from "./gameobjects/bricktilebutton.js";
import CharacterRBG from "./gameobjects/charactergearclimb.js";
import CharacterRBC from "./gameobjects/charactergearground.js";
import CharacterHandler from "./gameobjects/characterhandler.js";
import ZIndexHandler from "./gameobjects/zindexhandler.js";
window.onload = function() {
  const canvas = document.querySelector("canvas");
  if (!canvas)
    throw new Error("Can't get canvas");
  new Engine(canvas, "assets/scenes/", "scenes", ["LevelInterface", "LEVEL_28"], [
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
    CharacterRBC,
    CharacterRBG,
    CharacterHandler,
    Counter,
    Cursor,
    CursorIcon,
    FPSCounter,
    MobileIndicator,
    LevelSequence,
    Sprite,
    Stud,
    ZIndexHandler
  ], false);
};
//# sourceMappingURL=load.js.map
