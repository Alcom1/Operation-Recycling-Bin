import GameObject, { Collision } from "engine/gameobjects/gameobject";
import { RING_BITSTACK as gcb, MASKS, zip } from "engine/utilities/math";
import { CharacterParams } from "./character";
import CharacterGear from "./charactergear";

//Character states
enum ClimbState {
    NORMAL,
    WAIT,
    HALT
}

//Character sub-states for vertical movement
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
            vertState == VertState.DOWN ?  1 : 0;

        this.setStateIndex(ClimbState.NORMAL);  //Set normal state
        this.animationsCurr.forEach(x =>        //Adjust clipping for up/down movement
            x.zModifierPub = (vertState == null || x.isBackSlice) ? 0 : 2);
    }

    //Update position to move forward
    protected updatePosition() {

        //Don't update position for special states (WAIT, HALT, etc)
        if(this.stateIndex != ClimbState.NORMAL) {
            return;
        }

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

        //Different collision sequences based on state & vertical sub-state
        switch(this.stateIndex) {
    
            case ClimbState.NORMAL :
                switch(this.move.y) {
                    //Move forward, please.
                    case 0 : 
                        this.resolveCollisionNormal();
                        break;

                    //Move up
                    case -1 : 
                        this.resolveCollisionUp();
                        break;

                    //Move down
                    case 1 : 
                        this.resolveCollisionNormal(true);
                        break;
                }
                break;

            case ClimbState.WAIT :
                this.resolveCollisionWait();
                break;

            case ClimbState.HALT :
                this.resolveCollisionNormal();
                break;
        }
    }

    //Standard collision resolution
    private resolveCollisionNormal(isDownSwap : Boolean = false) {

        //No floor, go down
        if (!this.isColFlor) {
            this.setNormalState(VertState.DOWN);
        }
        //No front wall, go forward
        else if (!this.isColFace) {
            this.setNormalState();
        }
        //Downward movement does back THEN wall check
        else if (isDownSwap) {
            this.resolveCollisionsDown();
        }
        //Standard wall THEN back check
        else {
            this.resolveCollisionStandard();
        }
    }

    //Standard UP -> BACK -> HALT check
    private resolveCollisionStandard() {
        
        //No roof, go up
        if (!this.isColRoof) {
            this.setStateIndex(ClimbState.WAIT);
        }
        //No back wall, go back
        else if(!this.isColBack) {
            this.setNormalState();
            this.reverse();
        }
        //Completely boxed in, halt
        else {
            this.setStateIndex(ClimbState.HALT);
        }
    }

    //Downward BACK -> UP -> HALT check
    private resolveCollisionsDown() {

        if(!this.isColBack) {
            this.setNormalState();
            this.reverse();
        }
        //No roof, go up
        else if (!this.isColRoof) {
            this.setStateIndex(ClimbState.WAIT);
        }
        //Completely boxed in, halt
        else {
            this.setStateIndex(ClimbState.HALT);
        }
    }

    //Upward collision resolution
    private resolveCollisionUp() {

        //Land
        if(!this.isColFace && this.isColLand) {
            this.setNormalState();
        }
        //Backwards land
        else if(!this.isColBack && this.isColBand) {
            this.setNormalState();
            this.reverse();
        }
        //Continue upwards
        else if(!this.isColRoof && this.vertCount < this.vertMax) {
            //Here be dragons!
        }
        //Default to standard if there's no land, band, or continue
        else {
            this.resolveCollisionNormal();
        }
    }

    //Waiting collision resolution
    private resolveCollisionWait() {
        
        //Go up
        if (!this.isColRoof) {
            this.setNormalState(VertState.UP);
        }
        //Default to standard if there's a roof
        else {
            this.resolveCollisionNormal();
        }
    }
}