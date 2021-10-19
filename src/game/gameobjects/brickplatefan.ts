import Engine from "engine/engine";
import { Collider } from "engine/modules/collision";
import BrickPlate, { BrickPlateParams } from "./brickplate";

const brickPlateFanOverride = Object.freeze({
    images : ["brick_plate", "brick_plate_fan"]
});

export default class BrickPlateFan extends BrickPlate {

    constructor(engine: Engine, params: BrickPlateParams) {
        super(engine, Object.assign(params, brickPlateFanOverride));
    }

    //Get hazard and passive colliders of this brick.
    public getColliders() : Collider[] {

        //Combine with passive collider from base class
        return super.getColliders().concat(this.isOn ? [{   //Only return up hitbox if this plate is on.
            mask : 0b1000,          //Up!
            min : this.gpos.getAdd({ x : 1,              y : -1}),
            max : this.gpos.getAdd({ x : this.width - 1, y :  0}) 
        }] : []);
    }
}