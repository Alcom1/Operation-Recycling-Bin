import Engine from "engine/engine";
import { Collider } from "engine/modules/collision";
import Animat, { AnimationParams } from "./animation";
import BrickHandler from "./brickhandler";
import BrickPlate, { BrickPlateParams } from "./brickplate";

const brickPlateFanOverride = Object.freeze({
    images : ["brick_plate", "brick_plate_fan"]
});

export default class BrickPlateFan extends BrickPlate {

    private brickHandler!: BrickHandler;
    private animations: Animat[] = [];
    private beams: number[] = [];

    constructor(engine: Engine, params: BrickPlateParams) {
        super(engine, Object.assign(params, brickPlateFanOverride));

        //Going up to the ceiling
        for(let j = this.gpos.y - 1; j > 0; j--) {
            //Generate a wind animation for each position
            [0,1].forEach(i => {
                this.animations.push(this.parent.pushGO(new Animat(this.engine, {
                    ...params,
                    position : {x : this.gpos.x + i + 1, y : j},
                    subPosition : { x : 4, y : 0 }, 
                    zModifier : 10000,                                      
                    images : [{ name : "part_wind", offsetX : 0 }],
                    speed : 4,                                           
                    framesSize : 30,
                    frameCount : 2,
                    isLoop : true                                        
                } as AnimationParams)) as Animat);
            })
        }
    }

    public init() {

        //Get brick handler to to check brick-wind collisions
        this.brickHandler = this.engine.tag.get(
            "BrickHandler", 
            "LevelInterface")[0] as BrickHandler;

        //Set the beams for drawing the animations
        this.setBeams();
    }

    //Update wind beams
    public update() {

        //Set animations
        this.beams.forEach((y, x) => {
            this.animations.forEach(a => {
                if(a.gpos.x == this.gpos.x + x + 1) {
                    a.isVisible = a.gpos.y >= y
                }
            });
        });
    }

    //Set wind beams
    private setBeams() {

        //Set wind beams
        this.beams = [1, 2].map(i => {
            return this.brickHandler.checkCollisionRange(            
                { x : this.gpos.x + i, y : -1 },        //Position
                0,                                      //START
                this.gpos.y - 1,                        //FINAL
                this.gpos.y - 1).toString(2).length;    //HEIGHT
        });
    }

    //Get hazard and passive colliders of this brick.
    public getColliders() : Collider[] {
        
        //Set the beams for the collider (also for drawing the animations)
        this.setBeams();
        
        //Combine with passive collider from base class
        return super.getColliders().concat(this.isOn ? 
            this.beams.map((b, i) => {
                return {
                    mask : 0b1000,
                    min : { x : this.gpos.x + i + 1, y : b },
                    max : this.gpos.getAdd({ x : i + 2, y :  0})
                }
            }) : 
            []);
    }
}