import Vect, { Point } from "engine/utilities/vect";
import Scene from "engine/scene/scene";
import Engine from "engine/engine";

export interface GameObjectParams {
    position?: Point;
    subPosition?: Point;
    zIndex?: number;
    scene: Scene;
    name: string;
    tag?: string;
}

/** Base game object */
export default class GameObject {
    /** Grid position */
    public gpos: Vect;
    /** Sub-position */
    public spos: Vect;
    public zIndex: number;
    public tag: string;
    public parent: Scene;

    constructor(protected engine: Engine, params: GameObjectParams) {
        this.gpos = new Vect(params.position?.x ?? 0, params.position?.y ?? 0);
        this.spos = new Vect(params.subPosition?.x ?? 0, params.subPosition?.y ?? 0);
        this.zIndex = params.zIndex ?? 0;
        this.tag = params.tag ?? params.name;
        this.parent = params.scene;
    }

    /**
     * Initialize a game object after its scene is loaded.
     * @param ctx
     * @param scenes
     */
    init(ctx: CanvasRenderingContext2D, scenes: Scene[]): void {}

    /**
     * Compare two objects, return true if they are the same
     * @param gameObject GameObject to compare against
     * @returns Whether or not the game objects are the same
     */
    compare(gameObject: GameObject): boolean {
        //Default compare uses grid positions
        return gameObject.gpos.x == this.gpos.x && gameObject.gpos.y == this.gpos.y;
    }

    /**
     * Game object update
     * @param dt Delta time
     */
    update(dt: number): void {}

    /**
     * Game object draw
     * @param ctx
     */
    draw(ctx: CanvasRenderingContext2D): void {}
}
