import Engine from "engine/engine";
import ZGameObject, { ZGameObjectParams } from "./zgameobject";

export interface SpriteParams extends ZGameObjectParams {
    image: string;
    extension?: string;
}

/** Single image gameobject */
export default class Sprite extends ZGameObject {

    private image : HTMLImageElement;

    constructor(params: SpriteParams) {
        super(params);

        this.image = this.engine.library.getImage(params.image, params.extension);
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.drawImage(this.image, 0, 0);
    }
}