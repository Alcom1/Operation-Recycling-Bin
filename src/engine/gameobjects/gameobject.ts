import Vect, { Point } from "engine/utilities/vect";
import Scene from "engine/scene/scene";
import Engine from "engine/engine";
import { Collider } from "engine/modules/collision";
import { Step } from "engine/modules/sync";

export interface Collision {
    other : GameObject;
    mask : number;
}

export interface GameObjectParams {
    engine: Engine;
    position?: Point;
    subPosition?: Point;
    zIndex?: number;
    scene: Scene;
    name: string;
    tags?: [string];
    isActive?: boolean;
    isDebug: boolean;
}

/** Base game object */
export default class GameObject {

    /** Rand UUID generated upon instantiation */
    public id = (<any>crypto).randomUUID();
    /** Grid position */
    public gpos: Vect;
    /** Sub-position * */
    public spos: Vect;
    protected engine: Engine;
    public tags: string[];
    public parent: Scene;
    public isActive: Boolean;
    public isDebug: Boolean;
    private collisions: Collision[] = [];
    protected _zIndex : number;

    /** z-index get/setters */
    get zIndex() : number { return this._zIndex; }
    set zIndex(value : number) { this._zIndex = value; }
    get zpos() : Vect { return this.gpos; }
    get zState() : Boolean { return this.isActive }

    /** Constructor */
    constructor(params: GameObjectParams) {
        this.gpos = new Vect(params.position?.x ?? 0, params.position?.y ?? 0);
        this.spos = new Vect(params.subPosition?.x ?? 0, params.subPosition?.y ?? 0);
        this.tags = params.tags ?? [params.name];
        this.parent = params.scene;
        this.engine = params.engine;
        this.isActive = params.isActive ?? true;
        this.isDebug = params.isDebug ?? false;
        this._zIndex = params.zIndex ?? 0;
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
        // Default compare uses grid positions
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
     * Update positions for collisions step
    */
    public updateSync(step : Step, loopLength : number) {
    }

    /** 
     * Get all colliders for this game object
    */
    public getColliders() : Collider[] {
        return [];
    }

    /** 
     * Set collision to be resolved
    */
    public setCollision(mask : number, other : GameObject) {

        this.collisions.push({
            mask : mask,
            other : other
        });
    }    

    /** 
     * Resolve and clear all collisions
    */
    public resolveClearCollisions() {

        this.resolveCollisions(this.collisions);
        this.collisions = [];
    }

    /** 
     * Resolve all collisions
    */
    protected resolveCollisions(collisions : Collision[]) {

        collisions.forEach(c => this.resolveCollision(c.mask, c.other));
    }

    /** 
     * Resolve collision for this game object
    */
    protected resolveCollision(mask : number, other : GameObject) {

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
