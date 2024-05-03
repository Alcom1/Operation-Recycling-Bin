import { Collider } from "engine/modules/collision";
import { Faction, MASKS, Z_DEPTH } from "engine/utilities/math";
import Anim, { AnimationParams } from "./anim";
import BrickHandler from "./brickhandler";
import BrickTile, { BrickTileParams } from "./bricktile";
import BrickTileAnim from "./bricktileanim";
import Character from "./character";

/** Specifications of a fan tile */
const BrickTileFanOverride = Object.freeze({
    images : [["brick_tile_fan_off", "svg"]],
    width : 4,
    animName : "brick_tile_fan",
    animExtension : "svg",
    animSpeed : 8,
    animFrameCount : 2
});

/** Tile with a fan effect */
export default class BrickTileFan extends BrickTileAnim {

    private brickHandler!: BrickHandler;    // Brickhandler to get bricks to block wind effects
    private animations: Anim[] = [];        // Wind animations
    private beams: number[] = [];           // Beams of wind effects
    private characters: Character[] = [];   // Characters being tracked to block wind effects
    private delayTimers: number[] = [0, 0]; // Timers to delay activation of fully blocked winds
    private blockDelay = 0.25;              // Duration of delay for activating fully blocked winds

    /** Constructor */
    constructor(params: BrickTileParams) {
        super(Object.assign(params, BrickTileFanOverride));

        // Going up to the ceiling
        for(let j = this.gpos.y - 1; j > 0; j--) {
            // Generate a wind animation for each position
            [0,1].forEach(i => {
                this.animations.push(this.parent.pushGO(new Anim({
                    ...params,
                    zNoCompare : true,
                    tags : ["Wind"],
                    position : {x : this.gpos.x + i + 1, y : j},
                    subPosition : { x : Z_DEPTH / 2 - 2, y : -Z_DEPTH / 2 + 2 }, 
                    images : [{ name : "part_wind", extension : "svg" }],
                    speed : 2,
                    frameCount : 6,
                    isLoop : true                                        
                } as AnimationParams)) as Anim);
            })
        }

        // Start all wind effects as invisible
        this.animations.forEach(a => a.isVisible = false);
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
    }

    /** Update wind beams */
    public update(dt: number) {

        // Update timers for fully blocked winds
        this.delayTimers = this.delayTimers.map(t => {
            if(t > 0) {
                return t - dt;
            }
            else {
                return 0;
            }
        })
        
        // Set the beams for the collider (also for drawing the animations)
        this.setBeams();
    }

    /** Set wind beams */
    private setBeams() {

        // 2 beams per fan
        this.beams = [1, 2] 
        // Collide wind beams with bricks
        .map(i => {
            return this.brickHandler.checkCollisionRange(            
                { x : this.gpos.x + i, y : -1 },    // Position
                1,
                0,                                  // START
                this.gpos.y - 1,                    // FINAL
                this.gpos.y - 1,                    // HEIGHT
                1,
                Faction.SWISS).toString(2).length   // Characters are ignored here & handled later.
        })
        // Collide wind beams with characters
        .map((b, i) => {

            let ret = b;

            // Collide with each active character
            this.characters.filter(c => c.isActive).forEach(c => {
                if (c.gpos.y <= this.gpos.y &&
                    [1,2].some(x => x == c.gpos.x - this.gpos.x - i)) {
                    ret = Math.max(ret, c.gpos.y - c.height + 3);   // Stop beam underneath characters
                }
            });

            return ret;
        });

        // Set beams
        this.beams.forEach((y, x) => {

            //Start timers for fully blocked winds
            if(this.gpos.y - y == 0) {
                this.delayTimers[x] = this.blockDelay;
            }

            //Set animation visibility across beam length
            this.animations.forEach(a => {
                if (a.gpos.x == this.gpos.x + x + 1) {
                    a.isVisible = this.isOn && a.gpos.y >= y
                }
            });
        });
    }

    /** Get colliders for this brick. */
    public getColliders() : Collider[] {

        // Combine with passive collider from base class
        return super.getColliders().concat(this.isOn ? 
            this.beams.map((b, i) => {

                //Only return colliders for beams that aren't delayed
                if(this.delayTimers[i] == 0) {

                    return {
                        mask : MASKS.float,
                        min : { x : this.gpos.x + i + 1, y : b },
                        max : this.gpos.getAdd({ x : i + 2, y :  0})
                    } as Collider
                }

            }).filter(x => x) as Collider[] : []);  //Sheesh.
    }
}