import { Collider } from "engine/modules/collision";
import BrickPlate, { BrickPlateParams } from "./brickplate";

const brickJumpOverride = Object.freeze({
    images : ["brick_jump", "brick_jump"],
    width : 2,
    isOn : true
});

export default class BrickJump extends BrickPlate {

    constructor(params: BrickPlateParams) {
        super(Object.assign({}, brickJumpOverride, params));
    }

    //Get hazard and passive colliders of this brick.
    public getColliders() : Collider[] {

        //Combine with passive collider from base class, only return jump hitbox if this plate is on and not selected
        return super.getColliders().concat(this.isOn && !this.isSelected ? [{
            mask : 0b1000000,                               //Jump
            min : this.gpos.getAdd({ x : 0,          y : -1}),
            max : this.gpos.getAdd({ x : this.width, y :  0}) 
        }] : []);
    }
}
