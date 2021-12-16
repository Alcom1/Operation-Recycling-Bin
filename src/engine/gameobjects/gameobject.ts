import Vect, { Point } from "engine/utilities/vect";
import Scene from "engine/scene/scene";
import Engine from "engine/engine";
import { Collider } from "engine/modules/collision";
import { getZIndex } from "engine/utilities/math";

export interface GameObjectParams {
    engine: Engine;
    position?: Point;
    subPosition?: Point;
    zIndex?: number;
    scene: Scene;
    name: string;
    tags?: [string];
    isActive?: boolean;
}

/** Base game object */
export default class GameObject {

    /** Grid position */
    public gpos: Vect;
    /** Sub-position */
    public spos: Vect;
    protected engine: Engine;
    public tags: string[];
    public parent: Scene;
    public isActive: Boolean;

    constructor(params: GameObjectParams) {
        this.gpos = new Vect(params.position?.x ?? 0, params.position?.y ?? 0);
        this.spos = new Vect(params.subPosition?.x ?? 0, params.subPosition?.y ?? 0);
        this.tags = params.tags ?? [params.name];
        this.parent = params.scene;
        this.engine = params.engine;
        this.isActive = params.isActive ?? true;
    }

    /**
     * Initialize a game object after its scene is loaded.
     * @param ctx
     * @param scenes
     */
    public init(ctx: CanvasRenderingContext2D) {}

    /**
     * Compare two objects, return true if they are the same
     * @param gameObject GameObject to compare against
     * @returns Whether or not the game objects are the same
     */
    public compare(gameObject: GameObject): boolean {
        //Default compare uses grid positions
        return gameObject.gpos.x == this.gpos.x && gameObject.gpos.y == this.gpos.y;
    }

    /**
     * Game object update
     * @param dt Delta time
     */
    public hasTag(tag: string): boolean {
        return this.tags.some(t => t === tag);
    }

    /**
     * Get all colliders for this game object
     */
    public getColliders() : Collider[] {
        return [];
    }

    /**
     * Get the current z-index of this game object
     */
    public getGOZIndex() : number {
        return getZIndex(this.gpos);
    }

    /**
     * Resolve collision for this game object
     */
    public resolveCollision(mask : number, other : GameObject) {

    }

    /**
     * Game object update
     * @param dt Delta time
     */
    public update(dt: number) {}

    /**
     * Game object draw
     * @param ctx
     */
    public draw(ctx: CanvasRenderingContext2D) {}

    /**
     * Latter game object draw
     * @param ctx
     */
    public superDraw(ctx: CanvasRenderingContext2D) {}
}
