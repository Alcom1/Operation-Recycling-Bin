import Engine from "engine/engine";
import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";

interface SpriteParams extends GameObjectParams {
    image?: string;
    extention?: string;
}

export default class Sprite extends GameObject {

    private image = new Image();

    constructor(engine: Engine, params: SpriteParams) {
        super(engine, params);

        this.image.src = `/assets/img/${params.image}.${params.extention ?? "png"}`
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.drawImage(this.image, 0, 0);
    }
}