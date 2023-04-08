import { Collider } from "engine/modules/collision";
import { MASKS, Z_DEPTH } from "engine/utilities/math";
import Anim, { AnimationParams } from "./anim";
import BrickHandler from "./brickhandler";
import BrickTile, { BrickTileParams } from "./bricktile";
import Character from "./character";

/** Specifications of a fan tile */
const BrickTileFanOverride = Object.freeze({
    images : ["brick_tile", "brick_tile_fan"],
    width : 4
});

/** Tile with a fan effect */
export default class BrickTileFan extends BrickTile {

    private brickHandler!: BrickHandler;    // Brickhandler to get bricks to block wind effects
    private animations: Anim[] = [];        // Wind animations
    private beams: number[] = [];           // Beams of wind effects
    private characters: Character[] = [];   // Characters being tracked to block wind effects

    /** Constructor */
    constructor(params: BrickTileParams) {
        super(Object.assign(params, BrickTileFanOverride));

        // Going up to the ceiling
        for(let j = this.gpos.y - 1; j > 0; j--) {
            // Generate a wind animation for each position
            [0,1].forEach(i => {
                this.animations.push(this.parent.pushGO(new Anim({
                    ...params,
                    tags : ["Wind"],
                    position : {x : this.gpos.x + i + 1, y : j},
                    subPosition : { x : Z_DEPTH / 2 - 2, y : -Z_DEPTH / 2 + 2 }, 
                    images : [{ name : "part_wind" }],
                    speed : 2,
                    frameCount : 6,
                    isLoop : true                                        
                } as AnimationParams)) as Anim);
            })
        }
    }

    /** Initialize this fan */
    public init() {

        // Get brick handler to to check brick-wind collisions
        this.brickHandler = this.engine.tag.get(
            "BrickHandler", 
            "LevelInterface")[0] as BrickHandler;

        // Get characters to stop wind
        this.characters = this.engine.tag.get(
            "Character", 
            "Level") as Character[];

        // Set the beams for drawing the animations
        this.setBeams();
    }

    /** Update wind beams */
    public update() {

        // Set animations
        this.beams.forEach((y, x) => {
            this.animations.forEach(a => {
                if (a.gpos.x == this.gpos.x + x + 1) {
                    a.isVisible = this.isOn && a.gpos.y >= y
                }
            });
        });
    }

    /** Set wind beams */
    private setBeams() {

        // 2 beams per fan
        this.beams = [1, 2] 
        // Collide wind beams with bricks
        .map(i => {
            return this.brickHandler.checkCollisionRange(            
                { x : this.gpos.x + i, y : -1 },        // Position
                1,
                0,                                      // START
                this.gpos.y - 1,                        // FINAL
                this.gpos.y - 1).toString(2).length;    // HEIGHT
        })
        // Collide wind beams with characters
        .map((b, i) => {

            let ret = b;

            // Collide with each character
            this.characters.forEach(c => {
                if (c.gpos.y <= this.gpos.y &&
                    [1,2].some(x => x == c.gpos.x - this.gpos.x - i)) {
                    ret = Math.max(ret, c.gpos.y - c.height + 3);   // Stop beam underneath characters
                }
            });

            return ret;
        })
    }

    /** Get hazard and passive colliders of this brick. */
    public getColliders() : Collider[] {
        
        // Set the beams for the collider (also for drawing the animations)
        this.setBeams();
        
        // Combine with passive collider from base class
        return super.getColliders().concat(this.isOn ? 
            this.beams.map((b, i) => {
                return {
                    mask : MASKS.float,
                    min : { x : this.gpos.x + i + 1, y : b },
                    max : this.gpos.getAdd({ x : i + 2, y :  0})
                }
            }) : 
            []);
    }
}