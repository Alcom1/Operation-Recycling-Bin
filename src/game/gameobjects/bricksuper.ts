import Engine from "engine/engine";
import { Collider } from "engine/modules/collision";
import { getZIndex, GMULTY } from "engine/utilities/math";
import BrickPlate, { BrickPlateParams } from "./brickplate";

const brickSuperOverride = Object.freeze({
    images : ["brick_super_off", "brick_super"],
    width : 2,
    isOn : true
});

export default class BrickSuper extends BrickPlate {

    constructor(engine: Engine, params: BrickPlateParams) {
        super(engine, Object.assign(params, brickSuperOverride));
    }

    //Get hazard and passive colliders of this brick.
    public getColliders() : Collider[] {

        //Combine with passive collider from base class
        return super.getColliders().concat(this.isOn ? [{ //Only return super hitbox if this plate is on.
            mask : 0b10000,           //Super
            min : this.gpos.getAdd({ x : 0,          y : -1}),
            max : this.gpos.getAdd({ x : this.width, y :  0}) 
        }] : []);
    }

    //Explode
    public resolveCollision(mask : number) {

        //Turn off
        if (mask & 0b10000) {
            this.isOn = false;
            this.image = this.images[+this.isOn];
        }
    }
}
