import GameObject, { Collision } from "engine/gameobjects/gameobject";
import { RING_BITSTACK as gcb, MASKS, zip } from "engine/utilities/math";
import { Point } from "engine/utilities/vect";
import Anim, { AnimationParams } from "./anim";
import { CharacterParams } from "./character";
import CharacterGear, { GearState } from "./charactergear";

/** Specifications of a climb character */
const CharacterGearClimbOverride = Object.freeze({
    height: 2,
    speed : 3.0,
    animMain : {
        images : [
            { name : "char_rbc_left",   extension : "svg",  offsetX : 0},
            { name : "char_rbc_right",  extension : "svg",  offsetX : 0},
            { name : "char_rbc_up",     extension : "svg",  offsetX : 0},
            { name : "char_rbc_down",   extension : "svg",  offsetX : 0}],
        frameCount : 2,
        animsCount : 1
    },
    isGlide : true,

    // Misc animation parameters
    animsMisc : [{
        speed : 3.0,
        images : [{ name : "char_rbc_stop", extension : "svg",  offsetX : 0 }],
        frameCount : 2,
        gposOffset : { x : -3, y : 0}
    },{
        speed : 3.0,
        images : [{ name : "char_rbc_up",   extension : "svg",  offsetX : 0 }],
        frameCount : 2,
        gposOffset : { x : -3, y : 0}
    }]
});

/** A New Kind of Gearbot!  */
export default class CharacterGearClimb extends CharacterGear {
    
    private vertMax :   number = 3;                 // Maximum vertical climb height
    private vertCount : number = 0;                 // Vertical climb tracker
    private burstAnim : Anim;
    
    protected get animationSubindex() : number {    // Include up & down animations (reminder : animation arrays are zippered)

        // Animation is based on up/down movement
        switch(this.move.y) {

            // Move forward, please.
            case 0 :
                return this.move.x;

            // Move up
            case -1 : 
                return zip(2);

            // Move down
            default : 
                return zip(3);
        }
    }

    /** Constructor */
    constructor(params: CharacterParams) {
        super(Object.assign(params, CharacterGearClimbOverride));

        this.burstAnim = this.parent.pushGO(new Anim({
            ...params,
            images : [{ name : "char_rbc_burst", extension : "svg" }],
            speed : 3,
            frameCount : 6,
            zIndex : 50000
        } as AnimationParams)) as Anim;
    }

    /** Update this character */
    public update(dt: number) {
        super.update(dt);

        this.burstAnim.spos = this.spos.getAdd({x : -25, y : 16});
    }

    /** Update position to move forward */
    public handleStep() {

        // Don't update position for special states (WAIT, HALT, etc)
        if (this._stateIndex != GearState.NORMAL) {
            return;
        }

        // Move in different directions based on state
        switch(this.move.y) {

            // Move forward, please.
            case 0 : 
                this.moveAll({x : this.move.x, y : 0});
                break;

            // Move down
            case 1 : 
                this.moveAll({x : 0, y : 1});
                break;

            // Move up
            case -1 : 
                this.moveAll({x : 0, y : -1});
                this.vertCount ++;
                break;
        }

        // Update burst animation
        this.burstAnim.reset(this.gpos);
    }    
    
    /** */
    public handleStepUpdate(proxs : Point[]) {
        super.handleStepUpdate(proxs);

        switch(this._stateIndex) {

            // Currently moving. Normal checks for FORWARD & DOWN, special check for UP
            case GearState.NORMAL :

                // Handle vertical states differently
                switch(this.move.y) {

                    // Moving forward or down
                    case 0 : 
                    case 1 : 
                        this.handleStandardStep();
                        break;
        
                    // Moving up
                    case -1 : 
                        // Forward ledge, go forward, but don't climb each other
                        if(!this.isColFace && this.isColLand &&
                            !proxs.some(p => p.y == 2 && Math.sign(p.x) == this.move.x)) {

                            this.vertCount = 0;
                            this.move.y = 0;
                            this.setStateIndex(GearState.NORMAL);
                        }
                        // Rear ledge, go backwards, but don't climb each other
                        else if(!this.isColBack && this.isColBand &&
                            !proxs.some(p => p.y == 2 && Math.sign(p.x) == -this.move.x)) {

                            this.vertCount = 0;
                            this.move.y = 0;
                            this.setStateIndex(GearState.NORMAL);
                            this.reverse();
                        }
                        // Height limit or blocked, stop climbing
                        else if(this.isColRoof || this.vertCount >= this.vertMax) {

                            this.vertCount = 0;
                            this.reverse();
                            this.setStateIndex(GearState.WAIT);
                        }
                        break;
                }
                break;

            // Currently stuck. Keep checking normal movement while stopped.
            case GearState.STOP :
                this.handleStandardStep();
                break;

            // Currently waiting. Go up if not blocked, do standard check otherwise
            case GearState.WAIT :

                // Move down if there is no floor
                if(!this.isColFlor) {
                    this.move.y = 1;
                    this.setStateIndex(GearState.NORMAL);
                }
                // Move up if there is no ceiling
                else if(!this.isColRoof) {
                    this.move.y = -1;
                    this.setStateIndex(GearState.NORMAL);
                }
                // Move back if there is no wall behind
                else if(!this.isColBack) {
                    this.move.y = 0;
                    this.setStateIndex(GearState.NORMAL);
                    this.reverse();
                }
                // Move forward if there is floor
                else if(!this.isColFace) {
                    this.move.y = 0;
                    this.setStateIndex(GearState.NORMAL);
                }
                // Completely boxed in, just stop
                else {
                    this.move.y = 0;
                    this.setStateIndex(GearState.STOP);
                }
                break;
        }
    }

    /** */
    private handleStandardStep() {

        // Move down if there is no floor
        if(!this.isColFlor) {
            this.move.y = 1;
            this.setStateIndex(GearState.NORMAL);
        }
        // Move forward if there is floor
        else if(!this.isColFace) {

            this.move.y = 0;
            this.setStateIndex(GearState.NORMAL);
        }
        // Move up if there is no ceiling
        else if(!this.isColRoof) {

            this.move.y = 0;
            this.setStateIndex(GearState.WAIT);
        }
        // Move back if there is no wall behind
        else if(!this.isColBack) {

            this.move.y = 0;
            this.setStateIndex(GearState.WAIT);
        }
        // Completely boxed in, just stop
        else {
            this.move.y = 0;
            this.setStateIndex(GearState.STOP);
        }
    }
}