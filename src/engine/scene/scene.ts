import Engine from "engine/engine";
import GameObject from "engine/gameobjects/gameobject";
import { GMULTX, GMULTY } from "engine/utilities/math";

export interface SceneParams {
    name?: string,
    need?: string[],
    zIndex?: number,
    gameObjects?: GameObject[],
    initialized?: boolean;
}

export default class Scene {
    public name: string;
    private need: string[];
    public zIndex: number;
    private gameObjects: GameObject[];
    private initialized: boolean;

    constructor(
        private engine: Engine,
        {
            name = "nameless",
            need = [],
            zIndex = 0,
            gameObjects = [],
            initialized = false
        }: SceneParams
    ) {
        this.name = name;
        // Required scenes for this scene to initialize
        this.need = need;
        this.zIndex = zIndex;
        this.gameObjects = [];
        this.initialized = false;
    }

    init(ctx: CanvasRenderingContext2D, scenes: Scene[]) {
        
        if (
            !this.initialized && 
            this.need.every(n => this.engine.tag.exists(n))
        ) {

            ctx.save();
                this.gameObjects.forEach(go =>  go.init(ctx, scenes));
            ctx.restore();

            this.initialized = true;
        }
    }

    clear() {
        this.gameObjects = []
    }

    pushGO(gameObject: GameObject) {
        // Establish parent scene before pushing
        gameObject.parent = this;
        this.gameObjects.push(gameObject);
    }

    sortGO() {
        //Sort game objects by z-index.
        this.gameObjects.sort((a, b) => a.zIndex - b.zIndex);
    }

    update(dt: number) {
        if(this.initialized) {
            this.gameObjects.forEach(go =>  go.update(dt));
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.initialized) {
            for (const go of this.gameObjects) {
                ctx.save();
                ctx.translate(
                    go.gpos.x * GMULTX + go.spos.x, 
                    go.gpos.y * GMULTY + go.spos.y
                );
                go.draw(ctx);
                ctx.restore();
            }
        }
    } 
}
