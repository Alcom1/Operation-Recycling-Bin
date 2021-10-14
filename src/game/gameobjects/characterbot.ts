import Engine from "engine/engine";
import Character, { CharacterParams } from "./character";
import { BOUNDARY, GMULTX, GMULTY, bitStack, colRectRectSizes} from "engine/utilities/math";
import Scene from "engine/scene/scene";
import Animat, { AnimationParams } from "./animation";
import CharacterBin from "./characterbin";
import { Collider } from "engine/modules/collision";

export interface CharacterBotParams extends CharacterParams {
    imagesMisc : AnimationParams[];
}

const characterBotOverride = Object.freeze({
    height: 4,
    speed : 2.5,
    images : [
        { name : "char_bot_left", offsetX : 36 },
        { name : "char_bot_right", offsetX : 14}],
    imagesMisc : [{
        images : [{ name : "char_bot_bin", offsetX : 0 }],
        frameWidth : 126,
        gposOffset : { x : -1, y : 0},
        frameCount : 12
    },{
        images : [{ name : "char_bot_explosion", offsetX : 0 }],
        framesSize : 200,
        gposOffset : { x : -3, y : 0},
        frameCount : 16,
        loop : false
    }],
    frameCount : 10,
    animsCount : 2
});

const cbc = Object.freeze({
    flor : bitStack([0, 7]),
    down : bitStack([1, 8]),
    ceil : bitStack([2, 9]),
    head : bitStack([3]),
    wall : bitStack([4, 5]),
    step : bitStack([6])
});

export default class CharacterBot extends Character {

    private timer : number = 0;
    private bins : CharacterBin[] = [];

    constructor(engine: Engine, params: CharacterBotParams) {
        super(engine, Object.assign(params, characterBotOverride));

        params.imagesMisc.forEach(i => {

            var newIndex = this.spriteGroups.push([]) - 1;
            this.spriteGroups[newIndex].push(new Animat(this.engine, {
                images : i.images,
                framesSize : i.framesSize,
                gposOffset : i.gposOffset,
                frameCount : i.frameCount,
                loop : i.loop
            } as AnimationParams));
            this.parent.pushGO(this.spriteGroups[newIndex][0]);
        });
    }

    public init(ctx: CanvasRenderingContext2D, scenes: Scene[]): void {
        super.init(ctx, scenes);

        this.bins = this.engine.tag.get("CharacterBin", "Level") as Character[];
    }

    protected handleUniqueMovmeent(dt : number) {

        this.timer += dt;

        if(this.timer > 1) {

            switch(this.spriteGroupIndex) {
                
                case 1 :
                    this.timer = 0;
                    this.setCurrentGroup(0);
                    break;

                default :
                    this.isActive = false;
                    break;
            }
        }
    }

    protected handleCollision() {

        //Collision bitmask
        let cbm = this.brickHandler.checkCollisionRange(
            this.gpos.getSub({x: this.move.x > 0 ? 1 : 0, y : 5}),  //Position
            5,                                                      // n + 1
            15,                                                     //(n + 3) * 2 + 1
            7,                                                      // n + 3
            this.move.x);                                           //Direction

        // var qq = ""

        // for(let i = 0; i < 8; i++) {
        //     if(cbm & 1 << i) {
        //         qq += i + " ";
        //     }
        // }
        
        //WALL BOUNDARY
        if(
            this.gpos.x - 1 < BOUNDARY.minx || 
            this.gpos.x + 1 > BOUNDARY.maxx) {

            this.reverse();
        }
        else {

            //WALL - REVERSE
            if(cbm & cbc.wall) {
                this.reverse();
            }
            //HEAD-WALL - REVERSE
            else if(cbm & cbc.head && cbm & cbc.flor) {
                this.reverse();
            }
            //UP-STEP - GO UP
            else if(cbm & cbc.step) {

                //BLOCKED BY CEILING
                if(cbm & cbc.ceil || this.gpos.y <= BOUNDARY.miny + 3) {
                    this.reverse();
                }
                else {
                    this.gpos.y -= 1;
                }
            }
            //FLOOR - DO NOTHING
            else if(cbm & cbc.flor) {

            }
            //DOWN-STEP - GO DOWN
            else if(cbm & cbc.down) {
                this.gpos.y += 1;
            }
            //VOID - REVERSE
            else {
                this.reverse();
            }
        }
    }

    //
    public getColliders() : Collider[] {
        
        return [{ 
            mask : 0b111,   //All collisions
            min : this.gpos.getAdd({ x : -1, y : 1 - this.height}),
            max : this.gpos.getAdd({ x :  1, y : 1}) 
        },{ 
            mask : 0,       //Passive
            min : this.gpos.getAdd({ x : -1, y : 1 - this.height}),
            max : this.gpos.getAdd({ x :  1, y : 1}) 
        }];
    }

    //Explode
    public resolveCollision(mask : number) {

        if (mask & 0b010) {
            this.setCurrentGroup(1);
        }
        else if (mask & 0b100 && this.isNormalMovment) {
            this.setCurrentGroup(2);
        }
    }
}
