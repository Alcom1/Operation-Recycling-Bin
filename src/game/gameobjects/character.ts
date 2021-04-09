import Engine from "engine/engine";
import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { GMULTX, GMULTY } from "engine/utilities/math";
import Vect, { Point } from "engine/utilities/vect";

interface CharacterParams extends GameObjectParams {
    size?: Point;
    speed?: number;
}

export default class Character extends GameObject {
    private size: Vect;
    private speed: number;
    private text: string = '';

    constructor(engine: Engine, params: CharacterParams) {
        super(engine, params);
        this.size = new Vect(params.size?.x ?? 0, params.size?.y ?? 0);
        this.speed = params.speed ?? 1;
    }

    public update(dt: number) {

        //Increment position by speed
        this.spos.x += this.speed * GMULTX * dt;

        //Step grid position further once subposition goes past a grid-unit
        if(this.spos.x > GMULTX) {
            this.spos.x -= GMULTX;
            this.gpos.x += 1;
        }
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "#F00"
        ctx.globalAlpha = 0.5;
        ctx.fillRect(
            0, 
            0, 
            this.size.x * GMULTX, 
           -this.size.y * GMULTY);
    }
}
