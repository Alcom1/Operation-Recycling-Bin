import Engine from "../engine/engine.js";
import BrickHandler from "./gameobjects/brickhandler.js";
import BrickPlate from "./gameobjects/brickplate.js";
import Stud from "./gameobjects/stud.js";
import Button from "./gameobjects/button.js";
import ButtonScene from "./gameobjects/buttonscene.js";
import Character from "./gameobjects/character.js";
import CharacterBin from "./gameobjects/characterbin.js";
import CharacterBot from "./gameobjects/characterbot.js";
import CollisionHandler from "./gameobjects/collisionhandler.js";
import Counter from "./gameobjects/counter.js";
import Cursor from "./gameobjects/cursor.js";
import CursorIcon from "./gameobjects/cursoricon.js";
import FPSCounter from "./gameobjects/fpscounter.js";
import LevelSequence from "./gameobjects/levelsequence.js";
import MobileIndicator from "./gameobjects/mobileindicator.js";
import Sprite from "./gameobjects/sprite.js";
import BrickNormal from "./gameobjects/bricknormal.js";
window.onload = function() {
  const canvas = document.querySelector("canvas");
  if (!canvas)
    throw new Error("Can't get canvas");
  new Engine(canvas, "assets/scenes/", "scenes", [
    BrickHandler,
    BrickPlate,
    BrickNormal,
    Button,
    ButtonScene,
    Character,
    CharacterBot,
    CharacterBin,
    CollisionHandler,
    Counter,
    Cursor,
    CursorIcon,
    FPSCounter,
    MobileIndicator,
    LevelSequence,
    Sprite,
    Stud
  ]);
};
//# sourceMappingURL=load.js.map
