import BrickPlate, { BrickPlateParams } from "./brickplate";
import WaterDrop from "./waterdrop";

const brickPipeOverride = Object.freeze({
    images : ["brick_pipe", "brick_pipe"],
    width : 2
});

export default class BrickPipe extends BrickPlate {

    private drop : WaterDrop;
    private rate : number = 2.5;
    private antiDelay : number = 1;
    private timer : number = this.antiDelay + Math.random() * (this.rate - this.antiDelay);

    constructor(params: BrickPlateParams) {
        super(Object.assign(params, brickPipeOverride));

        this.drop = this.parent.pushGO(new WaterDrop(params)) as WaterDrop;
    }

    update(dt : number) {
        this.timer += dt;

        if (this.timer > this.rate) {
            this.timer = 0;
            this.drop.reset(this.gpos);
        }
    }
}
