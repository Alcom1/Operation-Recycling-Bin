import { Collider } from "engine/modules/collision";
import BrickPlateTop, { BrickPlateTopParams } from "./brickplatetop";

const brickSuperOverride = Object.freeze({
    images : ["brick_super_off", "brick_super"],
    imageTop : "brick_super_top"
});

export default class BrickSuper extends BrickPlateTop {

    constructor(params: BrickPlateTopParams) {
        super(Object.assign(params, brickSuperOverride));
    }

    //Get hazard and passive colliders of this brick.
    public getColliders() : Collider[] {

        //Combine with passive collider from base class, only return jump hitbox if this plate is on and not selected
        return super.getColliders().concat(this.isOn && !this.isSelected ? [{
            mask : 0b10000,           //Super
            min : this.gpos.getAdd({ x : 0,          y : -1}),
            max : this.gpos.getAdd({ x : this.width, y :  0}) 
        }] : []);
    }

    //Turn off
    public resolveCollision(mask : number) {

        //Turn off
        if (mask & 0b10000) {
            this.setOnOff(false);
        }
    }
}
