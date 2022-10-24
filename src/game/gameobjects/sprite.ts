import ZGameObject, { ZGameObjectParams } from "./zgameobject";

/** Sprite parameters */
export interface SpriteParams extends ZGameObjectParams {
    image: string;
    extension?: string;
}

/** Single image gameobject */
export default class Sprite extends ZGameObject {
    private image : HTMLImageElement;

    /** Constructor */
    constructor(params: SpriteParams) {
        super(params);

        this.image = this.engine.library.getImage(params.image, params.extension);
    }

    /** Draw this sprite */
    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.drawImage(this.image, 0, 0);
    }
}