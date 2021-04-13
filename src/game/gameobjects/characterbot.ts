import Engine from "engine/engine";
import Character, { CharacterParams } from "./character";
import { BOUNDARY, GMULTX, GMULTY } from "engine/utilities/math";
import Vect from "engine/utilities/vect";
import { GameObjectParams } from "engine/gameobjects/gameobject";

const characterBotOverride = Object.freeze({
    speed : 2.5
});

export default class CharacterBot extends Character {
    private sceneName: string | null = null;

    public init(ctx: CanvasRenderingContext2D): void {
        super.init(ctx);
    }

    constructor(engine: Engine, params: GameObjectParams) {
        super(engine, Object.assign(params, characterBotOverride) as CharacterParams);
    }

    protected handleCollision() {

        //Collision bitmask
        let cbm = this.brickHandler.checkCollisionSuper(
            this.gpos.getSub(new Vect(this.move.x > 0 ? 1 : 0, 5)),   //Position
            5,                                                        // n + 1
            14,                                                       //(n + 3) * 2
            7,                                                        // n + 3
            this.move.x);                                             //Direction

        // var qq = ""

        // for(let i = 0; i < 8; i++) {
        //     if(c & 1 << i) {
        //         qq += i + " ";
        //     }
        // }

        // console.log(qq);
        
        //WALL BOUNDARY
        if(
            this.gpos.x - 1 < BOUNDARY.minx || 
            this.gpos.x + 1 > BOUNDARY.maxx) {

            this.move.x *= -1;
            this.gpos.x += this.move.x;
        }
        else {

            //WALL - REVERSE
            if(cbm & 0b000110000) {
                this.move.x *= -1;
                this.gpos.x += this.move.x;
            }
            //HEAD-WALL - REVERSE
            else if(cbm & 0b000001000 && cbm & 0b010000001) {
                this.move.x *= -1;
                this.gpos.x += this.move.x;
            }
            //UP-STEP - GO UP
            else if(cbm & 0b001000000) {

                //BLOCKED BY HEADBRICK
                if(cbm & 0b000000100) {
                    this.move.x *= -1;
                    this.gpos.x += this.move.x;
                }
                else {
                    this.gpos.y -= 1;
                }
            }
            //FLOOR - DO NOTHING
            else if(cbm & 0b010000001) {

            }
            //DOWN-STEP - GO DOWN
            else if(cbm & 0b100000010) {
                this.gpos.y += 1;
            }
            //VOID - REVERSE
            else {
                this.move.x *= -1;
                this.gpos.x += this.move.x;
            }
        }
    }

    public draw(ctx: CanvasRenderingContext2D) {

        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = "#F00"
        ctx.lineWidth = 4;
        ctx.strokeRect(
           -GMULTX, 
            GMULTY, 
            GMULTX * 2, 
            GMULTY * -4);

        ctx.translate(-this.spos.x, 0);
        
        ctx.fillStyle = "#FF0"
        ctx.beginPath();
        ctx.moveTo(-GMULTX, GMULTY);
        ctx.lineTo(-GMULTX, GMULTY + GMULTY * -4 + (this.move.x < 0 ? 1 : 0) * GMULTY);
        ctx.lineTo(      0, GMULTY + GMULTY * -4);
        ctx.lineTo( GMULTX, GMULTY + GMULTY * -4 + (this.move.x > 0 ? 1 : 0) * GMULTY);
        ctx.lineTo( GMULTX, GMULTY);
        ctx.fill();
    }
}
