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
    animsMisc : AnimationParams[];
}

/** Base character */
export default class Character extends GameObject {

    public get height() { return this._height; }    // Collision height of this character
    protected _height: number;
    public get move() { return this._move; }        // Movement direction of this character
    protected _move: Vect;                          
    private _speed: number;                         // Speed of this character
    public get speed() { return this._speed }
    protected brickHandler!: BrickHandler;          // Brick handler for brick pressure (bricks under this character)
    private checkCollision: boolean;                // If collision needs to be checked
    private isGlide: boolean;                       // If the character sprite matches the character's subposition

    protected animations: Anim[] = [];              // Animations, 2D array for character-states and then sub-states
    protected stateAnimations: number[];            // Array of which animation each state uses. Sometimes it's not 1:1.
    protected stateIndex: number = 0;               // Current state

    /** Getters */
    protected get animationsCurr() : Anim {                               // The animations for the current state
        return this.animations[this.stateAnimations[this.stateIndex]]; 
    }
    public get isNormalMovment() : boolean { return this.stateIndex == 0 }  // If the current state is normal movment
    protected get animationSubindex() : number { return this.move.x }       // Sub-index for animations (by default, based on horizontal movement)
   
    /** Set zIndex of animations, too! */
    get zIndex() : number { return super.zIndex; }
    set zIndex(value : number) { 
        super.zIndex = value; 
        this.animations.forEach(s => s.zIndex = value);
    }

    /** Constructor */
    constructor(params: CharacterParams) {
        super(params);

        this.tags.push("Character");                                    // All characters need to share a tag
        
        this._speed = params.speed ?? 1;                                 // Default speed
        this._move = new Vect(params.isForward ?? true ? 1 : -1, 0);    // Default move direction
        this._height = params.height ?? 2;                              // Default height for a character
        this.isGlide = params.isGlide ?? false;                         // Default glide state
        this.checkCollision = true;                                     // Force initial collision check
        this.stateAnimations = [0, ...(
            params.stateAnimations ?? (                                 // Get special state animations or...
            params.animsMisc ? params.animsMisc.map((x, i) => i + 1) :  // Get default animations or...
            []))];                                                      // There's only one animation.

        const mainZIndex = this.height * 100 - 1;                       // Z-index of main slices in the character sprite

        // Add segment to scene and this character
        this.animations.push(new Anim({
            ...params,
            speed : this.isGlide ? 6 : params.speed, 
            isLoop : this.isGlide,          // Loops are handled manually by non-gliders to prevent stuttering
            framesSize : GMULTX * 6,        // Wide frame
            gposOffset : { x : -3, y : 0 }  // Move back by 1. Animations are centered around this character
        } as AnimationParams));

        // Setup miscellaneous animations.
        params.animsMisc?.forEach(m => {

            this.animations.push(new Anim({
                ...params,
                ...m
            } as AnimationParams));
        });

        //Add animations to scene
        this.animations.forEach(a => this.parent.pushGO(a));
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

        // Normal movement
        if (this.isNormalMovment) {

            // Only gliders have gradual normal movement
            if (this.isGlide) {

                // Horizontal movement
                if (this.move.y == 0) {
                    this.spos.x += this.move.x * this._speed * GMULTX * dt;
                }
                // Vertical movement
                else {
                    this.spos.y += this.move.y * this._speed * GMULTY * dt;
                }
            }
        }
        // Movement for special states
        else {

            this.handleSpecialMovement(dt);
        }
        
        // Glide characters move gradually, continously set the animation to match its subposition
        if (this.isGlide) {
            this.animationsCurr.spos = this.spos;
        }
    }

    /** Special movement. Do nothing - override */
    protected handleSpecialMovement(dt: number) {
        
    }

    /** Reverse the direction of this character */
    protected reverse() {

        this.move.x *= -1;                                          // Reverse direction
        this.animations[0].setImageIndex(this.animationSubindex);   // Establish sprites for new direction
        
        // If gliding force-reset the sprite to match its current position
        if (this.isGlide) {
            this.animationsCurr.reset(this.gpos);
        }
    }

    /** Set current & active group based on the group index */
    public setStateIndex(index? : number) {
        
        this.stateIndex = index ?? this.stateIndex;
        this.animations.forEach((s, i) => {
            s.isActive = i == this.stateAnimations[this.stateIndex];
            s.spos.setToZero(); // Reset subposition
            s.reset(this.gpos); // Make sure all sprites are in the character's position after set
        });
        this.animationsCurr.setImageIndex(this.animationSubindex);
    }

    /** Deactivate this character */
    public deactivate() {

        this.isActive = false;
        this.animations.forEach(s => s.isActive = false);
    }
}