import Engine from "engine/engine";
import Character, { CharacterParams } from "./character";
import Scene from "engine/scene/scene";

const characterBinOverride = Object.freeze({
    height: 3,
    speed : 0,
    images : [
        { name : "char_bin", offset : -4 }],
    animFrames : 1,
    animCount : 1
});

export default class CharacterBin extends Character {

    constructor(engine: Engine, params: CharacterParams) {
        super(engine, Object.assign(params, characterBinOverride));
    }
}
