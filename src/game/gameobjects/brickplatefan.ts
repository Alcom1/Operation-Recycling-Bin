import { Collider } from "engine/modules/collision";
import { Z_DEPTH } from "engine/utilities/math";
import Animat, { AnimationParams } from "./animation";
import BrickHandler from "./brickhandler";
import BrickPlate, { BrickPlateParams } from "./brickplate";
import Character from "./character";

const brickPlateFanOverride = Object.freeze({
    images : ["brick_plate", "brick_plate_fan"],
    width : 4
});

export default class BrickPlateFan extends BrickPlate {

    private brickHandler!: BrickHandler;
    private animations: Animat[] = [];
    private beams: number[] = [];
    private characters: Character[] = [];

    constructor(params: BrickPlateParams) {
        super(Object.assign(params, brickPlateFanOverride));

        //Going up to the ceiling
        for(let j = this.gpos.y - 1; j > 0; j--) {
            //Generate a wind animation for each position
            [0,1].forEach(i => {
                this.animations.push(this.parent.pushGO(new Animat({
                    ...params,
                    position : {x : this.gpos.x + i + 1, y : j},
                    subPosition : { x : Z_DEPTH / 2 - 2, y : -Z_DEPTH / 2 + 2 }, 
                    zModifier : 1,                                      
                    images : [{ name : "part_wind", offsetX : 0 }],
                    speed : 2,
                    frameCount : 6,
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

        //Get characters to stop wind
        this.characters = this.engine.tag.get(
            "Character", 
            "Level") as Character[];

        //Set the beams for drawing the animations
        this.setBeams();
    }

    //Update wind beams
    public update() {

        //Set animations
        this.beams.forEach((y, x) => {
            this.animations.forEach(a => {
                if(a.gpos.x == this.gpos.x + x + 1) {
                    a.isVisible = this.isOn && a.gpos.y >= y
                }
            });
        });
    }

    //Set wind beams
    private setBeams() {

        //2 beams per fan
        this.beams = [1, 2] 
        //Collide wind beams with bricks
        .map(i => {
            return this.brickHandler.checkCollisionRange(            
                { x : this.gpos.x + i, y : -1 },        //Position
                0,                                      //START
                this.gpos.y - 1,                        //FINAL
                this.gpos.y - 1).toString(2).length;    //HEIGHT
        })
        //Collide wind beams with characters
        .map((b, i) => {

            let ret = b;

            //Collide with each character
            this.characters.forEach(c => {
                if (c.gpos.y <= this.gpos.y &&
                    [1,2].some(x => x == c.gpos.x - this.gpos.x - i)) {
                    ret = Math.max(ret, c.gpos.y - c.height + 3);   //Stop beam underneath characters
                }
            });

            return ret;
        })
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