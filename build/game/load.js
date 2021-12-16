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
import BrickPlateHot from "./gameobjects/brickplatehot.js";
import BrickPlateFan from "./gameobjects/brickplatefan.js";
import BrickSuper from "./gameobjects/bricksuper.js";
import BrickPipe from "./gameobjects/brickpipe.js";
import BrickJump from "./gameobjects/brickjump.js";
import BrickHandlerDebug from "./gameobjects/brickhandlerdebug.js";
import BrickJumpMove from "./gameobjects/brickjumpmove.js";
import BrickPlateButton from "./gameobjects/brickplatebutton.js";
import CharacterRBG from "./gameobjects/characterrbg.js";
window.onload = function() {
  const canvas = document.querySelector("canvas");
  if (!canvas)
    throw new Error("Can't get canvas");
  new Engine(canvas, "assets/scenes/", "scenes", ["LevelInterface", "LEVEL_10"], [
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
    CharacterRBG,
    Counter,
    Cursor,
    CursorIcon,
    FPSCounter,
    MobileIndicator,
    LevelSequence,
    Sprite,
    Stud
  ], false);
};
//# sourceMappingURL=load.js.map
