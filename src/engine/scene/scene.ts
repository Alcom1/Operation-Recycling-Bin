import Engine from "engine/engine";
import GameObject from "engine/gameobjects/gameobject";
import { GMULTX, GMULTY } from "engine/utilities/math";

export interface SceneParams {
    name?: string,
    tag?: string,
    need?: string[],
    zIndex?: number,
    gameObjects?: GameObject[],
    initialized?: boolean;
}

export default class Scene {

    public name: string;                // Name of this scene
    public tag: string;                 // Tag for this scene
    public zIndex: number;              // Z-index of this scene, compared to other scenes
    private need: string[];             // Scenes this scene requires
    private gameObjects: GameObject[];  // Game objects in this scene
    public initialized: boolean;        // If scene is initialized
    private isUpdate: boolean = true;   // If scene should be updating
    private isDraw: boolean = true;     // If scene should be drawing
    public get isPaused() : boolean {   // Scene's paused state
        return !this.isUpdate 
    }

    /** Constructor */
    constructor(
        private engine: Engine,
        params : SceneParams) {
        
        this.name = params.name ?? "unnamed";
        this.tag = params.tag ?? "notag";
        this.need = params.need ?? [];  // Required scenes for this scene to initialize
        this.zIndex = params.zIndex ?? 0;
        this.gameObjects = [];
        this.initialized = false;
    }

    /** Initialize this scene */
    public init(ctx: CanvasRenderingContext2D) {
        
        if (
            !this.initialized && 
            this.need.every(n => this.engine.tag.exists(n))
        ) {

            ctx.save();
                this.gameObjects.forEach(go =>  go.init(ctx));
            ctx.restore();

            this.engine.sync.pushGOs(this.name, this.gameObjects);
            this.engine.collision.pushGOs(this.name, this.gameObjects);

            this.initialized = true;
        }
    }

    /** Add a new game object */
    public pushGO(gameObject: GameObject) : GameObject {

        // Establish parent scene before pushing
        gameObject.parent = this;
        this.gameObjects.push(gameObject);
        this.engine.tag.pushGO(this, gameObject, this.name);
        return gameObject;
    }

    /** Pause this scene and also the sync updates in the engine */
    public pause() {
        this.isUpdate = false;
        this.engine.pause();
    }

    /** Unpause this scene and also the sync updates in the engine */
    public unpause() {
        this.isUpdate = true;
        this.engine.unpause();
    }

    /** Update all active game objects in this scene if ready */
    public update(dt: number) {

        // Update all game objects
        if (this.initialized && this.isUpdate) {
            this.gameObjects.filter(go => go.isActive).forEach(go => go.update(dt));
        }
    }

    /** Draw all active game objects in this scene if ready */
    public draw(ctx: CanvasRenderingContext2D) {

        // Sort all game objects for drawing - unconditionally
        this.gameObjects.sort((a, b) => a.zIndex - b.zIndex);

        if (this.initialized && this.isDraw) {
            this.gameObjects.filter(go => go.isActive).forEach(go => this.subDraw(ctx, go, go.draw));
        }
    }

    /** Draw all active game objects in this scene if ready */
    public superDraw(ctx: CanvasRenderingContext2D) {

        if (this.initialized && this.isDraw) {
            this.gameObjects.filter(go => go.isActive).forEach(go => this.subDraw(ctx, go, go.superDraw));
        }
    }

    /** Perform drawing for a game object */
    private subDraw(ctx: CanvasRenderingContext2D, gameObject : GameObject, drawAction : Function) {

        ctx.save();
        ctx.translate(
            gameObject.gpos.x * GMULTX + gameObject.spos.x, 
            gameObject.gpos.y * GMULTY + gameObject.spos.y
        );
        drawAction.call(gameObject, ctx);
        ctx.restore();
    }
}
