import GameObject, { Collision } from "engine/gameobjects/gameobject";
import { RING_BITSTACK as gcb, MASKS, zip } from "engine/utilities/math";
import { CharacterParams } from "./character";
import CharacterGear from "./charactergear";

// Character states
enum ClimbState {
    NORMAL,
    WAIT,
    HALT
}

// Character sub-states for vertical movement
enum VertState {
    UP,
    DOWN
}

/** Specifications of a climb character */
const CharacterGearClimbOverride = Object.freeze({
    height: 2,
    speed : 3.0,
    images : [
        { name : "char_rbc_left",   offsetX : 0 },
        { name : "char_rbc_right",  offsetX : 0},
        { name : "char_rbc_up",     offsetX : 0},
        { name : "char_rbc_down",   offsetX : 0}],
    frameCount : 2,
    animsCount : 1,
    isGlide : true,

    // Misc animation parameters
    animsMisc : [
    {
        speed : 3.0,
        images : [{ name : "char_rbc_up", offsetX : 0 }],
        frameCount : 2,
        gposOffset : { x : -1, y : 0},
        isSliced : true
    },{
        speed : 3.0,
        images : [
            { name : "char_rbc_left", offsetX : 0 },
            { name : "char_rbc_right", offsetX : 0}],
        frameCount : 2,
        gposOffset : { x : -1, y : 0},
        isSliced : true
    }]
});

/** A New Kind of Gearbot!  */
export default class CharacterGearClimb extends CharacterGear {
    
    private vertMax :   number = 3;                 // Maximum vertical climb height
    private vertCount : number = 0;                 // Vertical climb tracker
    
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
    }

    /** Update position to move forward */
    protected updatePosition() {

        // Don't update position for special states (WAIT, HALT, etc)
        if (this.stateIndex != ClimbState.NORMAL) {
            return;
        }

        // Move in different directions based on state
        switch(this.move.y) {

            // Move forward, please.
            case 0 : 
                this.gpos.x += this.move.x;
                break;

            // Move up
            case -1 : 
                this.gpos.y -= 1;
                this.vertCount ++;
                break;

            // Move down
            case 1 : 
                this.gpos.y += 1;
                break;
        }
    }
}