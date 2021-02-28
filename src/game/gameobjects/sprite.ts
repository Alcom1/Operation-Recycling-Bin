import Engine from "engine/engine";
import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { pathImg } from "engine/utilities/math";

interface SpriteParams extends GameObjectParams {
    image: string;
    extension?: string;
}

/** Single image gameobject */
export default class Sprite extends GameObject {

    private image = new Image();

    constructor(engine: Engine, params: SpriteParams) {
        super(engine, params);

        this.image.src = pathImg(params.image, params.extension)
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.drawImage(this.image, 0, 0);
    }
}