import Engine from "engine/engine";
import { Collider } from "engine/modules/collision";
import BrickHandler from "./brickhandler";
import BrickPlate, { BrickPlateParams } from "./brickplate";

const brickPlateFanOverride = Object.freeze({
    images : ["brick_plate", "brick_plate_fan"]
});

export default class BrickPlateFan extends BrickPlate {

    private brickHandler!: BrickHandler;

    constructor(engine: Engine, params: BrickPlateParams) {
        super(engine, Object.assign(params, brickPlateFanOverride));
    }

    public init() {

        //Get brick handler to to check brick-wind collisions
        this.brickHandler = this.engine.tag.get(
            "BrickHandler", 
            "LevelInterface")[0] as BrickHandler;
    }

    //Get hazard and passive colliders of this brick.
    public getColliders() : Collider[] {

        var beams = [1, 2].map(i => {
            return this.brickHandler.checkCollisionRange(            
                { x : this.gpos.x + i, y : 0 },         //Position
                0,                                      //START
                this.gpos.y - 1,                        //FINAL
                this.gpos.y - 1).toString(2).length;    //HEIGHT
        });

        //Combine with passive collider from base class
        return super.getColliders().concat(this.isOn ? 
            beams.map((b, i) => {
                return {
                    mask : 0b1000,
                    min : { x : this.gpos.x + i + 1, y : b },
                    max : this.gpos.getAdd({ x : this.width - 1, y :  0}) 
                }
            }) : 
            []);
    }
}