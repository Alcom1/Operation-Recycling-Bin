import Engine from "engine/engine";
import { Collider } from "engine/modules/collision";
import Character, { CharacterParams } from "./character";

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
    
    //Get bin colliders
    public getColliders() : Collider[] {
        
        return [{ 
            mask : 0b010,   //Bot-Bin
            min : this.gpos.getAdd({ x : -1, y : 1 - this.height}),
            max : this.gpos.getAdd({ x :  1, y : 1}) 
        },{ 
            mask : 0,       //Passive
            min : this.gpos.getAdd({ x : -1, y : 1 - this.height}),
            max : this.gpos.getAdd({ x :  1, y : 1}) 
        }];
    }

    //Collect
    public resolveCollision(mask : number) {
    
        if (mask & 0b010) {
            this.deactivate();
        }
    }
}
