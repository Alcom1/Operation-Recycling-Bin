import { Collider } from "engine/modules/collision";
import BrickPlate, { BrickPlateParams } from "./brickplate";

const brickButtonOverride = Object.freeze({
    images : ["brick_button_off", "brick_button_on"],
    width : 2
});

export default class BrickPlateButton extends BrickPlate {
    
    plates: BrickPlate[] = [];
    private timer : number = 0;
    private waitDuration : number = 1.5;

    constructor(params: BrickPlateParams) {
        super(Object.assign(params, brickButtonOverride));
    }

    public init() {

        //Get plates affected by this button (also includes self?)
        this.plates = (this.engine.tag.get(
            "BrickPlate", 
            "Level") as BrickPlate[]).filter(p => p.circuit == this.circuit);

        console.log(this.plates); //0b10000000
    }

    //Update timer
    public update(dt: number) {
        
        this.timer = this.timer > 0 ? this.timer - dt : 0;
    }

    //Get hazard and passive colliders of this brick.
    public getColliders() : Collider[] {

        //Combine with passive collider from base class
        return super.getColliders().concat([{
            mask : 0b10000000,  //Button
            min : this.gpos.getAdd({ x : 0,          y : -1}),
            max : this.gpos.getAdd({ x : this.width, y :  0}) 
        }]);
    }
    
    //Flip
    public resolveCollision(mask : number) {

        //Turn off
        if (this.timer <= 0 && mask & 0b10000000) {
            this.setOnOff(!this.isOn);
            this.plates.forEach(p => p.setOnOff(this.isOn));
            this.timer = this.waitDuration;
        }
    }
}
