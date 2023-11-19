import BrickTile, { BrickTileParams } from "./bricktile";
import WaterDrop from "./waterdrop";

/** Specifications of a pipe brick */
const brickPipeOverride = Object.freeze({
    images : ["brick_pipe", "brick_pipe"],
    width : 2
});

/** A brick with a dripping pipe */
export default class BrickPipe extends BrickTile {

    private drop : WaterDrop;           // This pipe's water drop
    private rate : number = 2.5;        // Rate at which drop falls
    private minDelay : number = 1;      // Minimum value for the initial timer
    private timer : number = this.minDelay + Math.random() * (this.rate - this.minDelay);

    /** Constructor */
    constructor(params: BrickTileParams) {
        super(Object.assign(params, brickPipeOverride));

        this.drop = this.parent.pushGO(new WaterDrop(params)) as WaterDrop;
    }

    /** Update timer, reset drop when timer reaches rate */
    public update(dt : number) {

        this.timer += dt;               // Update timer

        // Reset drop
        if (this.timer > this.rate) {
            this.timer = 0;
            this.drop.reset(this.gpos);
        }
    }
}
