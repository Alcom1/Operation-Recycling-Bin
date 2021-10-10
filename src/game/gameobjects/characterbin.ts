import Engine from "engine/engine";
import Character, { CharacterParams } from "./character";
import Scene from "engine/scene/scene";

const characterBinOverride = Object.freeze({
    height: 3,
    speed : 0,
    images : [
        { name : "char_bin", offsetX : 0}],
    frameCount : 1,
    animsCount : 1
});

export default class CharacterBin extends Character {

    constructor(engine: Engine, params: CharacterParams) {
        super(engine, Object.assign(params, characterBinOverride));
    }
}
