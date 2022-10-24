import GameObject, { Collision, GameObjectParams } from "engine/gameobjects/gameobject";
import { GMULTX, GMULTY } from "engine/utilities/math";
import Vect, { Point } from "engine/utilities/vect";
import BrickHandler from "./brickhandler";
import Brick from "./bricknormal";
import Anim, { OffsetImageParams, AnimationParams } from "./anim";
import { Step, StepType } from "engine/modules/sync";

/** Parameters for a character */
export interface CharacterParams extends GameObjectParams {
    height? : number;
    speed? : number;
    images : OffsetImageParams[];
    frameCount : number;
    animsCount : number;
    isForward? : boolean;
    isGlide? : boolean;
    stateAnimations : number[];
    animsMisc : AnimationInputParams[];
}

/** Animation parameters with a sliced option */
interface AnimationInputParams extends AnimationParams {
    isSliced? : boolean;
}

/** Base character */
export default class Character extends GameObject {

    public get height() { return this._height; }    //Collision height of this character
    protected _height: number;
    public get move() { return this._move; }        //Movement direction of this character
    protected _move: Vect;                          
    protected brickHandler!: BrickHandler;          //Brick handler for brick pressure (bricks under this character)
    private checkCollision: boolean;                //If collision needs to be checked
    private speed: number;                          //Speed of this character
    private isGlide: boolean;                       //If the character sprite matches the character's subposition
    private underBricks: Brick[] = [];              //Bricks under pressure, under this character

    protected animations: Anim[][] = [[]];          //Animations, 2D array for character-states and then sub-states
    protected stateAnimations: number[];            //Array of which animation each state uses. Sometimes it's not 1:1.
    protected stateIndex: number = 0;               //Current state

    /** Getters */
    protected get animationsCurr() : Anim[] {                               //The animations for the current state
        return this.animations[this.stateAnimations[this.stateIndex]]; 
    }
    public get isNormalMovment() : boolean { return this.stateIndex == 0 }  //If the current state is normal movment */
    protected get animationSubindex() : number { return this.move.x }       //Sub-index for animations (by default, based on horizontal movement)

    /** Constructor */
    constructor(params: CharacterParams) {
        super(params);

        this.tags.push("Character");                                    //All characters need to share a tag
        
        this.speed = params.speed ?? 1;                                 //Default speed
        this._move = new Vect(params.isForward ?? true ? 1 : -1, 0);    //Default move direction
        this._height = params.height ?? 2;                              //Default height for a character
        this.isGlide = params.isGlide ?? false;                         //Default glide state
        this.checkCollision = true;                                     //Force initial collision check
        this.stateAnimations = [0, ...(
            params.stateAnimations ?? (                                 //Get special state animations or...
            params.animsMisc ? params.animsMisc.map((x, i) => i + 1) :  //Get default animations or...
            []))];                                                      //There's only one animation.

        const mainZIndex = this.height * 100 - 1;                       //Z-index of main slices in the character sprite
        
        //Spawn 3 animations, the sprite is sliced vertically into 2x wide segments for proper z-indexing
        for(let i = -1; i <= 1; i ++) {
            
            // Add segment to scene and this character
            this.animationsCurr.push(this.parent.pushGO(new Anim({
                    ...params,
                    speed : this.isGlide ? 6 : params.speed, 
                    isLoop : this.isGlide,                          //Loops are handled manually by non-gliders to prevent stuttering
                    zModifier : i < 1 ? mainZIndex : 29,            //Z-modifier for different slices
                    sliceIndex : i,                                 //This animation is sliced
                    framesSize : GMULTX * 2,                        //2x wide slices
                    gposOffset : { x : -1, y : 0 }                  //Move back by 1. Animations are centered around this character
                } as AnimationParams)) as Anim);
        }

        //Setup miscellaneous animations.
        params.animsMisc?.forEach(m => {

            //Build a new animation, store it here and in the scene
            var newIndex = this.animations.push([]) - 1;

            //3 slices if sliced, 1 otherwise
            for(let i = -1; i <= (m.isSliced ? 1 : -1); i ++) {

                this.animations[newIndex].push(new Anim({
                    ...params,
                    speed :      m.speed,
                    images :     m.images,
                    sliceIndex : m.isSliced ? i : null,
                    framesSize : m.isSliced ? GMULTX * 2 : m.framesSize,
                    gposOffset : m.gposOffset,
                    zModifier :  m.isSliced ? (i < 1 ? 300 : 29) : m.zModifier,
                    frameCount : m.frameCount,
                    animsCount : m.animsCount,
                    isLoop :     m.isLoop
                } as AnimationParams));
            }
            this.animations[newIndex].forEach(a => this.parent.pushGO(a));
        });
    }

    /** Initialize this character. Get brick handler & set the default state */
    public init() {

        // Get brickhandler for pressure checks
        this.brickHandler = this.engine.tag.get("BrickHandler", "LevelInterface")[0] as BrickHandler;

        // Set active groups
        this.setStateIndex();
    }

    /** Update this character */
    public update(dt: number) {

        //Normal movement
        if (this.isNormalMovment) {

            //Only gliders have gradual normal movement
            if (this.isGlide) {

                //Horizontal movement
                if (this.move.y == 0) {
                    this.spos.x += this.move.x * this.speed * GMULTX * dt;
                }
                //Vertical movement
                else {
                    this.spos.y += this.move.y * this.speed * GMULTY * dt;
                }
            }
        }
        //Movement for special states
        else {

            this.handleSpecialMovement(dt);
        }
        
        // Glide characters move gradually, continously set the animation to match its subposition
        if (this.isGlide) {
            this.animationsCurr.forEach(a => {
                a.spos = this.spos;
            });
        }
    }

    /** Special movement. Do nothing - override */
    protected handleSpecialMovement(dt: number) {
        
    }

    /** Manage bricks underneath this character, set pressure */
    protected handleBricks(isClear : boolean = false) {

        //Reset pressures
        this.underBricks.forEach(b => b.pressure -= 1);

        //Reset underbricks if we are clearing unconditionally.
        if (isClear) {
            this.underBricks = [];
        }
        //Otherwise, get a new set.
        else {
            //Get new set of bricks for pressures
            this.underBricks = this.brickHandler.checkCollisionRow(
                this.gpos.getAdd({x : -1, y : 1}), 
                2);
    
            //Set new pressures
            this.underBricks.forEach(b => b.pressure += 1);
        }

        //Cursor must perform a recheck.
        this.brickHandler.isRecheck = true;
    }

    /** Handle synchronized step movement. Do nothing - override */
    protected handleStep(isStart : boolean = false) {
        
    }

    /** Reverse the direction of this character */
    protected reverse() {

        this.move.x *= -1;                                                          //Reverse direction
        this.animations[0].forEach(x => x.setImageIndex(this.animationSubindex));   //Establish sprites for new direction
        
        //If gliding force-reset the sprite to match its current position
        if (this.isGlide) {
            this.animationsCurr.forEach(a => a.reset(this.gpos));
        }
    }

    /** Set current & active group based on the group index */
    protected setStateIndex(index? : number) {
        
        this.stateIndex = index ?? this.stateIndex;
        this.animations.forEach((sg, i) => sg.forEach(s => {
            s.isActive = i == this.stateAnimations[this.stateIndex];
            s.spos.setToZero(); //Reset subposition
            s.reset(this.gpos); //Make sure all sprites are in the character's position after set
        }));
        this.animationsCurr.forEach(x => x.setImageIndex(this.animationSubindex));
    }

    /** Deactivate this character */
    public deactivate() {

        this.isActive = false;
        this.animations.forEach(sg => sg.forEach(s => s.isActive = false));
        this.underBricks.forEach(b => b.pressure -= 1);
        this.underBricks = [];
    }

    /** Perform a sychronized update */
    public updateSync(step : Step, loopLength : number) {

        //Special start-step for gliders. Used for when nearby geometry must be detected.
        if (step.stepType == StepType.START && this.isGlide) {
    
            this.handleStep(true);
        }

        //The step matches this character's speed, perform an update
        if (step.stepType == StepType.SYNC && step.counter % (loopLength / this.speed) == 0) {

            this.spos = Vect.zero;
    
            this.handleStep();
            this.handleBricks();

            //Normal movement and all gliding movement demands a grid-position reset for all animations
            if (this.isNormalMovment || this.isGlide) {
                this.animationsCurr.forEach(s => s.reset(this.gpos));
            }
        }
    }
}