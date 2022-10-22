import GameObject, { Collision } from "engine/gameobjects/gameobject";
import { FOUR_BITSTACK as gcb, MASKS, zip } from "engine/utilities/math";
import { CharacterParams } from "./character";
import CharacterGear from "./charactergear";

enum ClimbState {
    NORMAL,
    WAIT,
    HALT,
    REVERSE
}

enum VertState {
    UP,
    DOWN
}

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

    //Misc animation parameters
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

export default class CharacterGearClimb extends CharacterGear {

    private vertMax :   number = 3;                 //Maximum vertical climb height
    private vertCount : number = 0;                 //Vertical climb tracker

    protected get animationSubindex() : number {    //Include up & down animations (reminder : animation arrays are zippered)

        //Animation is based on up/down movement
        switch(this.move.y) {

            //Move forward, please.
            case 0 :
                return this.move.x;

            //Move up
            case -1 : 
                return zip(2);

            //Move down
            default : 
                return zip(3);
        }
    }

    constructor(params: CharacterParams) {
        super(Object.assign(params, CharacterGearClimbOverride));
    }

    //Index reset with unique behaviors
    protected setStateIndex(index? : number) {
        this.vertCount = 0;         //Reset vertical counter
        super.setStateIndex(index); //Set index
    }

    //Sets a normal state with a vertical direction
    private setNormalState(vertState? : VertState) {

        //Go up, down, or horizontal
        this.move.y =
            vertState == VertState.UP   ? -1 :
            vertState == VertState.DOWN ?  1 : 0 

        this.setStateIndex(ClimbState.NORMAL);                                          //Set normal state
        this.animationsCurr.forEach(x => x.zModifierPub = vertState == null ? 0 : 20);  //Clipping fix for up/down movement
    }

    //Update position to move forward
    protected updatePosition() {

        //Move in different directions based on state
        switch(this.move.y) {

            //Move forward, please.
            case 0 : 
                this.gpos.x += this.move.x;
                break;

            //Move up
            case -1 : 
                this.gpos.y -= 1;
                this.vertCount ++;
                break;

            //Move down
            case 1 : 
                this.gpos.y += 1;
                break;
        }
    }

    //Resolve collisions based on the current stored bitmask
    public resolveCollisionBitmask() {

        switch(this.stateIndex) {
    
            case ClimbState.NORMAL :
                switch(this.move.y) {
                    //Move forward, please.
                    case 0 : 
                        this.resolveCollisionsNormal();
                        break;

                    //Move up
                    case -1 : 
                        this.resolveCollisionsUp();
                        break;

                    //Move down
                    case 1 : 
                        this.resolveCollisionsDown();
                        break;
                }
                break;

            case ClimbState.WAIT :
                this.resolveCollisionsNormal();
                break;

            case ClimbState.HALT :
                this.resolveCollisionsNormal();
                break;
        }
    }

    //Resolve collisions for normal movement
    public resolveCollisionsNormal() {

        //Go down for cliffs
        if(!(this.storedCbm & gcb.flor)) {
            this.setNormalState(VertState.DOWN);
        }
        //Go up for walls
        else if(this.storedCbm & gcb.face) {

            //Unless there's an immediate ceiling, then reverse instead
            if(this.storedCbm & gcb.ceil) {

                //If back is also blocked, completely stuck, halt.
                if(this.storedCbm & gcb.back)  {

                    this.setStateIndex(ClimbState.HALT);
                }
                else {

                    this.reverse();
                }
            }
            //actually go up
            else {
                this.setNormalState(VertState.UP);
                // if(this.stateIndex == ClimbState.WAIT) {
                //     this.setNormalState(VertState.UP);
                // }
                // else {
                //     this.setStateIndex(ClimbState.WAIT);
                // }
            }
        }
        //Default to normal state
        else {

            this.setNormalState();
        }
    }

    //Resolve collisions for upward movement
    public resolveCollisionsUp() {

        //Go forward if an opening is available
        if(!(this.storedCbm & gcb.face)) {
            this.setNormalState();
        }
        //Go back down if a ceiling is hit, or if the height limit is reached
        else if(this.storedCbm & gcb.ceil || this.vertCount >= this.vertMax) {
            this.setNormalState(VertState.DOWN);
        }
    }

    //Resolve collisions for downward movement
    public resolveCollisionsDown() {

        //Land & return to normal movement if there is a floor
        if(this.storedCbm & gcb.flor) {

            //Both face and back are blocked, go up again
            if(this.storedCbm & gcb.face && this.storedCbm & gcb.back) {

                //Edge case, ceiling is blocked too, halt
                if(this.storedCbm & gcb.ceil) {

                    this.setStateIndex(ClimbState.HALT);
                }
                //Go up
                else {
                    
                    this.setStateIndex(ClimbState.WAIT);
                }
            }
            //Otherwise, Go forward
            else {

                this.setNormalState();
    
                //Reverse if there is wall ahead upon landing
                if(this.storedCbm & gcb.face) {
                    this.reverse();
                }
            }
        }
    }
}