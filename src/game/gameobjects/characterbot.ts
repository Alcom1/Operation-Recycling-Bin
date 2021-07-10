import Engine from "engine/engine";
import Character, { CharacterParams, CharacterImageParams } from "./character";
import { BOUNDARY, GMULTX, GMULTY, bitStack} from "engine/utilities/math";
import Vect from "engine/utilities/vect";
import { GameObjectParams } from "engine/gameobjects/gameobject";
import Scene from "engine/scene/scene";
import SpriteAnimated, { SpriteAnimatedParams } from "./spriteanimated";

export interface CharacterBotParams extends CharacterParams {
    imagesMisc : CharacterImageParams[];
}

const characterBotOverride = Object.freeze({
    height: 4,
    speed : 2.5,
    images : [
        { name : "char_bot_left", offset : 36 },
        { name : "char_bot_right", offset : 14}],
    imagesMisc : [
        { name : "char_bot_bin", offset : 0 }],
    animFrames : 10,
    animCount : 2
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

    public init(ctx: CanvasRenderingContext2D, scenes: Scene[]): void {
        super.init(ctx, scenes);
    }

    constructor(engine: Engine, params: CharacterBotParams) {
        super(engine, Object.assign(params, characterBotOverride));

        var newIndex = this.spriteGroups.push([]) - 1;
        this.spriteGroups[newIndex].push(new SpriteAnimated(this.engine, {
            ...params, 
            images : params.imagesMisc,
            order : 0, 
            width : 126 
        } as SpriteAnimatedParams));
        this.parent.pushGO(this.spriteGroups[newIndex][0]);
    }

    protected handleUniqueMovmeent(dt : number) {

        this.timer += dt;
    }

    protected handleCollision() {

        //Collision bitmask
        let cbm = this.brickHandler.checkCollisionSuper(
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

        // console.log(qq);
        
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
}
