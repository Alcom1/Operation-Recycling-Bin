import { Collider } from "engine/modules/collision";
import { Point } from "engine/utilities/vect";
import { BrickPlateParams } from "./brickplate";
import BrickPlateTop from "./brickplatetop";

const brickJumpOverride = Object.freeze({
    images : ["brick_jump_up", "brick_jump"],
    imageTop : "brick_jump_top",
    isOnTop : false,
    width : 2,
    isOn : true
});

export default class BrickJump extends BrickPlateTop {

    private timer : number = 0;
    private offDuration : number = 0.1;
    private timer2 : number = 0;
    private offDuration2 : number = 1.2;

    constructor(params: BrickPlateParams) {
        super(Object.assign({}, brickJumpOverride, params));
    }

    public update(dt : number) {

        if(this.timer2 > 0) {
            this.timer2 -= dt;
        }
        else {
            this.timer2 = 0;
        }

        if(this.timer > 0) {
            this.timer -= dt;
        }
        else {
            this.timer = 0;
            this.setOnOff(true);
        }
    }

    //Get hazard and passive colliders of this brick.
    public getColliders() : Collider[] {

        //Combine with passive collider from base class, only return jump hitbox if this plate is on and not selected
        return super.getColliders().concat(this.isOn && this.timer2 == 0 && !this.isSelected ? [{
            mask : 0b1000000,   //Jump
            min : this.gpos.getAdd({ x : 0,          y : -1}),
            max : this.gpos.getAdd({ x : this.width, y :  0}) 
        }] : []);
    }

    //Turn off
    public resolveCollision(mask : number) {

        //Turn off
        if (mask & 0b1000000) {
            this.setOnOff(false);
            this.timer = this.offDuration;
            this.timer2 = this.offDuration2;
        }
    }
}
