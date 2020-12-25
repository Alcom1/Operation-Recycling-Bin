import Engine from "../engine/engine.js";
import Background from "./gameobjects/background.js";
import Brick from "./gameobjects/brick.js";
import BrickHandler from "./gameobjects/brickhandler.js";
import BrickStud from "./gameobjects/brickstud.js";
import Button from "./gameobjects/button.js";
import ButtonScene from "./gameobjects/buttonscene.js";
import Cursor from "./gameobjects/cursor.js";
import CursorIcon from "./gameobjects/cursoricon.js";
import FPSCounter from "./gameobjects/fpscounter.js";
import LevelSequence from "./gameobjects/levelsequence.js";
import UILevel from "./gameobjects/uilevel.js";
window.onload = function() {
  const canvas = document.querySelector("canvas");
  if (!canvas)
    throw new Error("Can't get canvas");
  new Engine(canvas, "assets/scenes/", ["level_interface", "level_1"], [
    Background,
    Brick,
    BrickHandler,
    BrickStud,
    Button,
    ButtonScene,
    Cursor,
    CursorIcon,
    FPSCounter,
    LevelSequence,
    UILevel
  ]);
};
//# sourceMappingURL=load.js.map
