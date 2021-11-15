import { Collider } from "engine/modules/collision";
import { Point } from "engine/utilities/vect";
import BrickHandler from "./brickhandler";
import { BrickPlateParams } from "./brickplate";
import BrickPlateTop from "./brickplatetop";

const brickJumpOverride = Object.freeze({
    images : ["brick_jump_up", "brick_jump"],
    imageTop : "brick_jump_top",
    isOnTop : false,
    isOn : true
});

export default class BrickJump extends BrickPlateTop {

    private brickHandler!: BrickHandler;
    private timer : number = 0;
    private offDuration : number = 1.0;
    private timer2 : number = 0;
    private offDuration2 : number = 1.2;

    constructor(params: BrickPlateParams) {
        super(Object.assign({}, brickJumpOverride, params));
    }

    public init() {

        //Get brick handler to to check if this jump is blocked by other bricks
        this.brickHandler = this.engine.tag.get(
            "BrickHandler", 
            "LevelInterface")[0] as BrickHandler;
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

    //Check if this brick is blocked by bricks on top
    public isBlocked() : boolean {

        //Grey bricks probably shouldn't perform this check.
        if(this.isGrey) {
            return false;
        }

        //Check for bricks
        return !!this.brickHandler.checkCollisionRange(
            this.gpos.getAdd({
                x : 0,
                y : -2
            }), //Position
            1,  //Direction
            0,  //START
            2,  //FINAL
            1); //HEIGHT
    }

    //Get hazard and passive colliders of this brick.
    public getColliders() : Collider[] {

        //Combine with passive collider from base class, only return jump hitbox if this plate is on and not selected
        return super.getColliders().concat(this.isOn && this.timer2 == 0 && !this.isSelected && !this.isBlocked() ? [{
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
