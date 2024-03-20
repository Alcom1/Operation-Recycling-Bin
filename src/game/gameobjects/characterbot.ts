import Character, { CharacterParams } from "./character";
import { BOUNDARY, bitStack, GMULTY, GMULTX, MASKS, Faction, Z_DEPTH} from "engine/utilities/math";
import { Collider } from "engine/modules/collision";
import { Point } from "engine/utilities/vect";
import GameObject, { Collision } from "engine/gameobjects/gameobject";
import SpriteSet, { SpriteParams } from "./spriteset";
import CharacterBotPart, { CharacterBotPartParams } from "./characterbotpart";
import Anim, { AnimationParams } from "./anim";

/** Armor states of a bot character */
enum ArmorState {
    NONE,
    ACTIVE,
    FLASH
}

/** States of a bot character */
enum BotState {
    NORMAL,
    HALTED,
    EATING,
    OUCHIE,
    FLYING,
    BOUNCE,
    SHIELD
}

/** Specifications of THE bot character */
const characterBotOverride = Object.freeze({
    // Main parameters
    faction: Faction.FRIENDLY,
    height: 4,      // Bot is this tall
    speed : 3,      // Bot moves fast
    stateAnimations : [1, 2, 3, 4, 4, 5],
    animMain : {
        images : [      // Bot has left & right animations
            { name : "char_bot_left" },
            { name : "char_bot_right" },
            { name : "char_bot_left_armor" },
            { name : "char_bot_right_armor" }],
        frameCount : 10,
        animsCount : 2
    },

    // Misc animation parameters
    animsMisc : [{
        images : [      // Bot has left & right animations
            { name : "char_bot_left" },
            { name : "char_bot_right" },
            { name : "char_bot_left_armor" },
            { name : "char_bot_right_armor" }],
        speed : 0,
        gposOffset : { x : -3, y : 0},
        frameCount : 10,
        animsCount : 2
    },{ // Bot-bin interaction animation
        images : [{ name : "char_bot_bin" }],
        speed : 2 / 3,
        gposOffset : { x : -1, y : 0},
        frameCount : 18
    },{ // Bot explodes, etc
        images : [{ name : "empty" }],
        frameCount : 1,
        isLoop : false
    },{ // Bot up animation
        images : [  // Flying has left & right animations
            { name : "char_bot_fly_left" },
            { name : "char_bot_fly_right" },
            { name : "char_bot_fly_left_armor" },
            { name : "char_bot_fly_right_armor" }],
        speed : 3,  // Bot moves fast
        gposOffset : { x : -3, y : 0},
        frameCount : 10,
        animsCount : 2
    },{ // Bot armor animation
        images : [
            { name : "char_bot_armor_left", offsetX : 36 },
            { name : "char_bot_armor_right", offsetX : 14 }],
        gposOffset : { x : -1, y : 0},
        frameCount : 12
    }]
});

// Collision bitmasks for bot-brick collisions
const gcb = Object.freeze({
    flor : bitStack(0, 7),
    down : bitStack(1, 8),
    ceil : bitStack(2, 9),
    head : bitStack(3),
    wall : bitStack(4, 5),
    step : bitStack(6)
});

// Collision bitmasks for bot-brick collisions in air
const acb = Object.freeze({
    flor : bitStack(0, 6),
    head : bitStack(1, 7),
    face : bitStack(8, 9, 10),
    shin : bitStack(11),
    foot : bitStack(12)
});

/** The one and only. */
export default class CharacterBot extends Character {

    private timerSpec : number = 0;                         // Timer to track duration of special movements
    private timerArmr : number = 0;                         // Timer to track armor flash
    private timerStep : number = 0;                         // Timer to track time since previous step
    private timerLand : number = 0;                         // Timer to track time since landing
    private ceilSubOffset : number = -6;                    // Offset for up/down movement
    private vertSpeed : number = 360;                       // Speed of air movement
    private vertMult : -1|1 = 1;                            // Up/Down multiplier for air movement
    private vertBlock : boolean = false;                    // If vertically blocked
    private horzSpeed : number = 300;                       // Horizontal air speed
    private jumpHeights : number[] = [0, 2, 3, 3, 2, 0];    // Individual heights throughout a jump
    private jumpOrigin : Point = { x : 0, y : 0 }           // Origin of the previous jump
    private armorDelay : number = 2;                        // Delay where armor remains after taking damage
    private armorFlashRate : number = 8;                    // Rate of the armor flashing effect
    private armorState : ArmorState = ArmorState.NONE;      // Current state of the armor
    private parts : CharacterBotPart[] = [];
    private partShock : SpriteSet;
    private partZap : Anim;
    private isZap : boolean = false;
    
    protected get animationSubindex() : number {               // Adjust animation index for armor flash effect
        return this.move.x * (
            this.armorState == ArmorState.ACTIVE ? 2 :
            this.armorState == ArmorState.FLASH  ? (1 + Math.floor(this.timerArmr * this.armorFlashRate) % 2) : 
            1)
    }

    /** z-index get/setters */
    public get zIndex() : number { return super.zIndex; }
    public set zIndex(value : number) {
        super.zIndex = value;
        
        //Z-index for ouchie effects
        if(this.stateIndex == BotState.OUCHIE) {

            //Zappy effect
            if(this.isZap) {
                this.partShock.zIndex = this.zIndex;
            }
            //Normal effect
            else {

                this.parts.forEach(p => {
                    p.zIndex = this.zIndex + p.index * 0.1;
                });
            }
        }
    }
    public get zpos() : Point { 
        return this.gpos.getAdd({ 
            x : -1,
            y : 1 - this.height + (this.spos.y < 0 && !this.vertBlock ? -1 : 0)
        });
    }
    public get zSize() : Point {
        return {
            x : 2,
            y : this.height + (this.spos.y != 0 && !this.vertBlock ? 1 : 0)
        }; 
    }

    /** Constructor */
    constructor(params: CharacterParams) {
        super(Object.assign(params, characterBotOverride));

        for(let i = 0; i < 4; i++) {

            this.parts.push(this.parent.pushGO(new CharacterBotPart({
                ...params,
                tags: [],
                position : this.gpos,
                image :
                    i == 0 ? [0,1].map(n => `char_bot_des_b${i}_${n}`) :
                    i == 1 ? [0,1,2,3].map(n => `char_bot_des_b${i}_${n}`) :
                    i == 2 ? [0,1,2].map(n => `char_bot_des_b${i}_${n}`) : 
                             [0,1].map(n => `char_bot_des_b${i}_${n}`),
                extension : "svg",
                isActive : false,
                index : i
            } as CharacterBotPartParams)) as CharacterBotPart);
        }

        this.partShock = this.parent.pushGO(new SpriteSet({
            ...params,
            tags: [],
            position : this.gpos,
            image : "char_bot_des_z",
            extension : "svg",
            isActive : false,
        } as SpriteParams)) as SpriteSet

        this.partZap = this.parent.pushGO(new Anim({
            ...params,
            images : [{ name : "zap" }],
            speed : 1,
            frameCount : 10,
            zIndex : 50000,
            isActive : false,
            isLoop : false,
        } as AnimationParams)) as Anim;
    }

    /** Unique bot update to update armor flash */
    public update(dt : number) {
        super.update(dt);

        this.timerStep += dt;   // Update step timer
        this.timerLand += dt;   // Update land timer

        // Update armor flash
        if (this.armorState == ArmorState.FLASH) {
            this.timerArmr += dt;
            this.animationCurr.setImageIndex(this.animationSubindex);

            // Remove armor after a duration and reset timer
            if (this.timerArmr > this.armorDelay) {
                this.armorState = ArmorState.NONE;
                this.timerArmr = 0;
            }
        }
    }

    /** Special movement */
    protected handleSpecialMovement(dt : number) {

        this.timerSpec += dt;   // Update special timer

        // Perform special movement
        switch(this._stateIndex) {

            // Vertical
            case BotState.EATING :
            case BotState.FLYING : 
                this.moveVertical(dt, this.vertMult);
                break;

            // Bounce
            case BotState.BOUNCE :
                this.moveBounce(dt);
                break;

            // Default - Do nothing
            default :
                break;
        }

        // If the current animation has ended
        if (this.timerSpec > this.animationCurr.duration) {

            // Reset timer
            this.timerSpec = 0;

            // Perform ending actions for different states
            switch(this._stateIndex) {

                // Dead - Do nothing, or force dead state for zap
                case BotState.OUCHIE :
                    if(this.isZap) {

                        //End zap effect
                        this.isZap = false;
                        this.partShock.isActive = false;
                        this.partZap.isActive = false;

                        //Show final ouch sprites
                        this.parts.forEach(p => {
                            p.isActive = true;
                            p.gpos = this.gpos.getAdd({x : -1, y : -this.height});
                            p.spos.y = Z_DEPTH;
                            p.goToEnd();
                        });
                    }
                    break;

                // Vertical - Reset up/down animation
                case BotState.FLYING :
                    this.animationCurr.reset();
                    break;

                // Bounce - Do nothing
                case BotState.BOUNCE :
                    break;
                
                // Default - End animation, return to ground movement
                default :
                    this.setStateIndex(BotState.HALTED);
                    break;
            }
        }
    }

    /** Vertical motion */
    private moveVertical(dt: number, dir: number) {

        // Don't update if vertically blocked and moving upward
        if(!this.vertBlock) {

            this.spos.y -= dt * this.vertSpeed * dir;   // Move subposition vertically based on speed
            this.animationCurr.spos = this.spos;       // Move animation to match
        }

        // Update grid position
        if (Math.abs(this.spos.y) > GMULTY) {
            this.moveAll({x : 0, y : Math.sign(this.spos.y)}, false)
            this.spos.y -= Math.sign(this.spos.y) * GMULTY;
        }
        this.handleBrickCollisionVertical();
        this.animationCurr.reset(this.gpos, false);
        this.animationCurr.spos = this.spos;
    }

    /** Move in a jumping arc */
    private moveBounce(dt: number) {

        let index = Math.abs(this.gpos.x - this.jumpOrigin.x);  // Index of current jump height

        // Don't jump past the level boundary
        if ((index > 0 || Math.abs(this.spos.x) > GMULTX / 2) && (
            this.gpos.x - 2 < BOUNDARY.minx || 
            this.gpos.x + 2 > BOUNDARY.maxx)) {

            this.startVertMovement();
            return;
        }

        // Collision bitmask
        const cbm = this.brickHandler.checkCollisionRange(
            this.gpos.getSub({
                x : this.move.x > 0 ? 1 : 0, 
                y : this.height + 1
            }),             // Position
            this.move.x,    // Direction
            5,              // START  n + 1
            18,             // FINAL
            6,              // HEIGHT n + 2
            3);             // Width
        
        // Collide face if we're over half-way past the first step
        if(cbm & acb.face && (index > 0 || Math.abs(this.spos.x) > GMULTX / 2)) {
            this.startVertMovement();
            return;
        }
        // Collide head if not at the peak of the jump
        else if((cbm & acb.head || this.gpos.y <= BOUNDARY.miny + 3) && index < 2) {
            this.startVertMovement();
            return;
        }
        // collide shin after the first step
        else if (cbm & acb.shin && index > 0) {
            this.startVertMovement();
            return;
        }
        // Collide with foot after the arc starts travelling downwards
        else if (cbm & acb.foot && index > 2) {
            this.startVertMovement();
            return;
        }
        // Collide with floor after the first step
        else if (cbm & acb.flor && index > 0) {
            this.endVertMovement();
            return;
        }

        // End of jump
        if(index > this.jumpHeights.length - 2) {
            this.startVertMovement();
            return;
        }

        // Update position, travel in an arc based on the jump heights.
        this.spos.x += this.move.x * this.horzSpeed * dt;   // Update horizontal position
        this.spos.y = - GMULTY * (                          // Update vertical position
            this.jumpHeights[index] + 
            this.gpos.y - 
            this.jumpOrigin.y +
            Math.abs(this.spos.x / GMULTX) * (this.jumpHeights[index + 1] - this.jumpHeights[index]));

        this.animationCurr.spos = this.spos;               // Update animations to match current position

        // store sub-position converted to a grid position
        let move = {
            x : Math.abs(this.spos.x) > GMULTX ? Math.sign(this.spos.x) : 0,
            y : Math.abs(this.spos.y) > GMULTY ? Math.sign(this.spos.y) : 0
        };

        // if sub-position is large enough to move, update position
        if(move.x || move.y) {
    
            this.moveAll(move, false);  // Go up or down to new grid position
            this.spos.sub({             // Reset subposition to match new grid position
                x : move.x * GMULTX,
                y : move.y * GMULTY
            });            
    
            // Update animation to match
            this.animationCurr.gpos.add(move);
        }
    }

    /** Quick shift to downward vertical movement */
    private startVertMovement() {

        // If bot is between studs, move forward instead of backward
        if (Math.abs(this.spos.x) > GMULTX / 2) {
            this.gpos.x += Math.sign(this.spos.x);  // Move forward by one.
        }

        this.vertMult = -1;                         // Default to downward movement to remove 1-frame hitch.
        this.setStateIndex(BotState.FLYING);        // Vertical movement
    }

    /** End vertical or jump movement */
    private endVertMovement() {

        this.spos.setToZero();  // Snap to grid
        this.timerLand = 0;     // Reset land timer

        // Go from air state to walking state for flying & bounce states
        if (this._stateIndex == BotState.FLYING ||
            this._stateIndex == BotState.BOUNCE) {

            this.setStateIndex(BotState.HALTED);
        }
    }

    /** Return true if the given vertical direction has an obstacle */
    private getCollisionVertical(dir : number) : boolean {

        // If moving upward and hit the ceiling, return true
        if (dir > 0 && this.gpos.y <= this.height + 1) {
            return true;
        }

        // Check for bricks in travelling direction
        return !!this.brickHandler.checkCollisionRange(
            this.gpos.getSub({
                x : 1,
                y : dir > 0 ? 1 + this.height : 0
            }), // Position
            1,  // Direction
            0,  // START
            2,  // FINAL
            1); // HEIGHT
    }

    /** Check and resolve brick collisions - Normal movement */
    public handleBrickCollisionNormal() {

        // WALL BOUNDARY
        if (this.gpos.x - 2 < BOUNDARY.minx && this.move.x < 0 || 
            this.gpos.x + 2 > BOUNDARY.maxx && this.move.x > 0) {

            this.reverse();
        }
        // Brick collisions
        else {

            // Collision bitmask
            const cbm = this.brickHandler.checkCollisionRange(
                this.gpos.getSub({
                    x : this.move.x > 0 ? 0 : 1, 
                    y : 1 + this.height
                }),             // Position
                this.move.x,    // Direction
                5,              // START :  n + 1
                15,             // FINAL : (n + 3) * 2 + 1
                7,              // HEIGHT:  n + 3
                undefined,
                this.faction);

            // NO FLOOR - FALL
            if(!this.getCollisionVertical(-1)) {
                this.startVertMovement();
            }
            // WALL - REVERSE
            else if (cbm & gcb.wall) {
                this.reverse();
            }
            // HEAD-WALL - REVERSE
            else if (cbm & gcb.head && cbm & gcb.flor) {
                this.reverse();
            }
            // UP-STEP - GO UP
            else if (cbm & gcb.step) {

                // BLOCKED BY CEILING
                if (cbm & gcb.ceil || this.gpos.y <= BOUNDARY.miny + 3) {
                    this.reverse();
                }
                else {
                    this.walkstep(-1);
                }
            }
            // FLOOR - DO NOTHING
            else if (cbm & gcb.flor) {
                this.walkstep(0);
            }
            // DOWN-STEP - GO DOWN
            else if (cbm & gcb.down) {
                this.walkstep(1);
            }
            // VOID - REVERSE
            else {
                this.reverse();
            }
        }
    }

    /** Shift forward, with a vertical offset to handle steps */
    private walkstep(vOffset : number) {

        this.moveAll({
            x : this.move.x,
            y : vOffset
        })
    }

    /** Check and resolve brick collisions - Vertical movement */
    protected handleBrickCollisionVertical() {

        // Reset vertical block for check
        this.vertBlock = false;
        
        // There is an obstacle, stop based on its direction
        if (this.getCollisionVertical(this.vertMult)) {

            this.vertBlock = true;                  // Block vertical movement

            // If going upwards, collide with ceiling
            if (this.vertMult > 0) {

                this.spos.y = this.ceilSubOffset;   // Set sub-position for block
                this.animationCurr.spos.y = this.ceilSubOffset;
            }
            // If going downwards, reset to walking
            else {
                this.endVertMovement();
            }
        }
    }

    /** Colliders for non-brick collisions */
    public getColliders() : Collider[] {
        
        // Back half of the bot shouldn't collide with wind, after a delay since stepping or landing
        let xShiftMin = this._stateIndex == 0 && this.timerLand > 0.15 && this.move.x > 0 ? 1 : 0; 
        let xShiftMax = this._stateIndex == 0 && this.timerLand > 0.15 && this.move.x < 0 ? 1 : 0; 
        
        return [{ 
            mask : MASKS.death | MASKS.zappy,
            min : this.gpos.getAdd({ x : -1, y : 1 - this.height}),
            max : this.gpos.getAdd({ x :  1, y : 1}) 
        },{ 
            mask : MASKS.scrap | MASKS.float,
            min : this.gpos.getAdd({ x : -1 + xShiftMin, y : 1 - this.height}),
            max : this.gpos.getAdd({ x :  1 - xShiftMax, y : 2}) 
        },{ 
            mask : MASKS.super | MASKS.jumps | MASKS.press,
            min : this.gpos.getAdd({ x : -1 - Math.min(this.move.x, 0), y : 0}),
            max : this.gpos.getAdd({ x :    - Math.min(this.move.x, 0), y : 1}) 
        }];
    }

    /** Also reset timer when setting the current group */
    public setStateIndex(index? : number) {

        // Only set state if it's different from the current
        if (this._stateIndex != index) {

            this.timerSpec = 0;         // Timer reset incase we cancelled a previous animation
            super.setStateIndex(index); // Set index

            // Force walk animation to sync with steps
            if(this._stateIndex == BotState.NORMAL) {
                this.animationCurr.timer = this.timerStep;
            }

            //Ouchie effects
            if(this._stateIndex == BotState.OUCHIE) {

                //Zappy effect
                if(this.isZap) {
                    this.partShock.isActive = true;
                    this.partShock.gpos = this.gpos.getAdd({x : -1, y : -this.height});
                    this.partShock.spos.y = Z_DEPTH;
                    this.partZap.isActive = true;
                    this.partZap.gpos = this.gpos.getAdd({x : -1, y : 0});
                }
                //Normal effect
                else {

                    this.parts.forEach(p => {
                        p.isActive = true;
                        p.gpos = this.gpos.getAdd({x : -1, y : -this.height});
                        p.spos.y = Z_DEPTH;
                    });
                }
            }
        }
    }

    /** Check and resolve brick collisions */
    public handleStep() {

        this.timerStep = 0; // Reset step timer

        switch(this._stateIndex) {

            case BotState.HALTED :
                this.setStateIndex(BotState.NORMAL);
                break;

            case BotState.NORMAL :
                this.handleBrickCollisionNormal();
                this.timerLand = 0; // Reset land timer for steps, too.
                break;

            default :
                break;
        }
    }

    /** Override collision check  */
    protected resolveCollisions(collisions : Collision[]) {
        super.resolveCollisions(collisions);
        
        // Start going down if flying but there's no float collisions
        if (!collisions.find(c => c.mask & MASKS.float) && this._stateIndex == BotState.FLYING) {
            this.vertMult = -1;         // Go down please
        }
    }

    /** Collisions */
    public resolveCollision(mask : number) {
        
        // Eat
        if (mask & MASKS.scrap) {
            this.vertMult = -1;         // Default to downward movement
            this.setStateIndex(BotState.EATING);
        }
        // Ouchie!!!
        else if ((mask & MASKS.death || mask & MASKS.zappy) && this._stateIndex != BotState.EATING) {

            // Start or continue flash after taking armor damage
            if (this.armorState == ArmorState.ACTIVE) {
                this.armorState = ArmorState.FLASH
            }
            // If unarmored, die.
            else if (this.armorState == ArmorState.NONE) {

                //Use zap effect instead of normal effect
                if(mask & MASKS.zappy) {
                    this.isZap = true;
                }

                this.setStateIndex(BotState.OUCHIE);
            }
        }
        // Vertical
        else if (mask & MASKS.float && this._stateIndex != BotState.OUCHIE) {
            this.vertMult = 1;          // Default to upward movement
            this.setStateIndex(BotState.FLYING);
        }
        // Bounce
        else if (mask & MASKS.jumps) {
            this.jumpOrigin = this.gpos.get;
            this.setStateIndex(BotState.BOUNCE);
        }
        // Armor
        else if (mask & MASKS.super) {
            this.armorState = ArmorState.ACTIVE;
            this.setStateIndex(BotState.SHIELD);
        }
    }
}