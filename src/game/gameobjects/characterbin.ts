import { Collider } from "engine/modules/collision";
import Character, { CharacterParams } from "./character";

const characterBinOverride = Object.freeze({
    height: 3,                                      //Bins are this tall
    speed : 0,                                      //Bins aren't animated
    images : [{ name : "char_bin", offsetX : -9}],   //Bin image
    frameCount : 1,
    animsCount : 1
});

export default class CharacterBin extends Character {

    constructor(params: CharacterParams) {
        super(Object.assign(params, characterBinOverride));
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
