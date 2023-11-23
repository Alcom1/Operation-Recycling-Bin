import Vect, { Point } from "engine/utilities/vect";
import Scene from "engine/scene/scene";
import Engine from "engine/engine";
import { Collider } from "engine/modules/collision";
import { Faction } from "engine/utilities/math";

export interface Collision {
    other : GameObject;
    mask : number;
}

export interface GameObjectParams {
    engine: Engine;
    position?: Point;
    subPosition?: Point;
    zIndex?: number;
    zNoCompare?: boolean;
    scene: Scene;
    name: string;
    tags?: [string];
    faction? : Faction;
    isActive?: boolean;
    isDebug: boolean;
}

/** Base game object */
export default class GameObject {

    /** Rand UUID generated upon instantiation */
    private _id = (<any>crypto).randomUUID();
    public get id() : boolean { return this._id; }

    /** Grid position */
    public gpos: Vect;

    /** Sub-position * */
    public spos: Vect;

    /** Engine access */
    protected engine: Engine;

    /** Tags to reference this and similar game objects */
    public tags: string[];

    /** Parent scene of this game object*/
    public parent: Scene;

    /** If this is an active game object */
    public isActive: Boolean;

    /** If this game object is in a debug state */
    public isDebug: Boolean;

    /** Stored collisions to be processed */
    private collisions: Collision[] = [];

    /**  */
    protected _faction: Faction;
    public get faction(): Faction { return this._faction; };

    /** z-index with get/setters */
    protected _zIndex : number;
    public get zIndex() : number { return this._zIndex; }
    protected _zNoCompare : boolean;
    public get zNoCompare() : boolean { return this._zNoCompare; }
    public set zIndex(value : number) { this._zIndex = value; }
    public get zpos() : Point { return this.gpos; }
    public get zState() : Boolean { return this.isActive; }
    public get zSize() : Point { return {x : 1, y : 1}; }
    public get zLayer() : Number { return 0; }

    /** Constructor */
    constructor(params: GameObjectParams) {
        this.gpos = new Vect(params.position?.x ?? 0, params.position?.y ?? 0);
        this.spos = new Vect(params.subPosition?.x ?? 0, params.subPosition?.y ?? 0);
        this.tags = params.tags ?? [params.name];
        this.parent = params.scene;
        this.engine = params.engine;
        this._faction = params.faction ?? Faction.NEUTRAL;
        this.isActive = params.isActive ?? true;
        this.isDebug = params.isDebug ?? false;
        this._zIndex = params.zIndex ?? 0;
        this._zNoCompare = params.zNoCompare ?? false;
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
     * If this game object has a specific tag
    */
    public hasTag(tag: string): boolean {
        return this.tags.some(t => t === tag);
    }

    /** 
     * Update positions for collisions step
    */
     public updateSync(counter : number, loopLength : number) {
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
}
