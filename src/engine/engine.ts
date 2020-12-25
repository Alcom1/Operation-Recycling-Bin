import GameObject, {GameObjectParams} from "./gameobjects/gameobject";
import BakerModule from "./modules/baker";
import MouseModule from "./modules/mouse";
import TagModule from "./modules/tag";
import Scene, {SceneParams} from "./scene/scene";
import {clamp} from "./utilities/math";

/** Engine core */
export default class Engine {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    
    /** Timestamp of last frame for calculating dt */
    private lastTime: number = 0;
    /** ID index of current frame */
    private animationID: number = 0;
    
    /** Path scenes are located in */
    private scenePath: string;
    /** Currently loaded scenes */
    private scenes: Scene[] = [];
    /** Names of scenes to be added next frame */
    private pushSceneNames: string[] = [];
    /** Names of scenes to be removed next frame */
    private killSceneNames: string[] = [];

    private gameObjectTypes = new Map<string, typeof GameObject>();

    public baker: BakerModule;
    public mouse: MouseModule;
    public tag: TagModule;

    constructor(
        element: HTMLCanvasElement,
        scenePathName: string,
        startScenes: string[],
        gameObjectTypes: typeof GameObject[],
        private width: number = 1296,
        private height: number = 864
    ) {
        this.scenePath = scenePathName;

        // Canvas/WebGL Context
        this.canvas = element;
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.maxWidth = this.canvas.width + "px";
        this.canvas.style.maxHeight = this.canvas.height + "px";
        const ctx = this.canvas.getContext('2d');
        if (!ctx) throw new Error("Unable to acquire WebGL context");
        this.ctx = ctx;

        // Set up modules
        this.baker = new BakerModule(this.canvas);
        this.mouse = new MouseModule(this.canvas);
        this.mouse.setResolution(this.canvas.width, this.canvas.height);
        this.tag = new TagModule();

        // Register available game object types
        this.registerGameObjects(gameObjectTypes)

        // Load each starting scene
        startScenes.forEach(s => this.loadScene(s));
        
        // Start the game loop
        this.frame();
    }

    /** Update loop */
    private frame() {
        this.animationID = requestAnimationFrame(() => this.frame());
        
        // Setup frame
        // Calculate time delta since last frame
        const dt = this.calculateDeltaTime();
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Unload and load scenes
        this.unloadScenes(this.killSceneNames);
        // Load each scene name in the push list
        this.pushSceneNames.forEach(sn => this.loadScene(sn));
        // Reset push list
        this.pushSceneNames = [];

        // Scene actions
        this.initScenes();
        this.updateScenes(dt);
        this.drawScenes();

        // Module updates
        this.mouse.update();
    }

    /** Initialize all scenes */
    private initScenes() {
        this.scenes.forEach(s => s.init(this.ctx, this.scenes));
    }

    /** Update all scenes */
    private updateScenes(dt: number) {
        this.scenes.forEach(s => s.update(dt));
    }

    /** Draw all scenes */
    private drawScenes() {
        this.scenes.forEach(s => s.draw(this.ctx));
    }

    /** Sort scenes by z-index */
    private sortScenes() {
        this.scenes.sort((a, b) => a.zIndex - b.zIndex);
    }

    /** Load a scene */
    private async loadScene(sceneName: string) {
        const sceneResponse = await fetch(`${this.scenePath}${sceneName}.json`);
        const sceneData: {
            scene: SceneParams;
            gameObjects: GameObjectParams[]
        } = await sceneResponse.json();
        const scene = new Scene(this, sceneData.scene);

        for (const goData of sceneData.gameObjects) {
            // Construct the object from its name
            const GOType = this.gameObjectTypes.get(goData.name);
            if (!GOType) throw new Error(`GameObject of type ${goData.name} does not exist`);
            const go = new GOType(this, {...goData, scene});
            scene.pushGO(go);
            this.tag.pushGO(go, scene.name);
        }

        scene.sortGO();
        this.scenes.push(scene);
        this.sortScenes();
    }

    /** Unload scenes pending removal */
    private unloadScenes(killSceneNames: string[]) {
        if (killSceneNames.length > 1) {
            // Clear scene names from core
            this.scenes = this.scenes.filter(s => !this.killSceneNames.includes(s.name)); 
            this.tag.clear(this.killSceneNames);
            this.killSceneNames = [];
        }
    }

    /** 
     * Set scenes to be loaded
     * @param fileNames File name(s) of scenes to load
     */
    public pushScenes(fileNames: string | string[]) {
        if (Array.isArray(fileNames)) {
            fileNames.forEach(s => this.pushScene(s));
        } else {
            this.pushScene(fileNames);
        }
    }

    /**
     * Set scenes to be unloaded
     * @param sceneNames Scene name(s) to be unloaded
     */
    public killScenes(sceneNames: string | string[]) {
        if (Array.isArray(sceneNames)) {
            sceneNames.forEach(s => this.killScene(s));
        } else {
            this.killScene(sceneNames);
        }
    }

    /**
     * Set scene to be loaded
     * @param fileName Filename of scene to load
     */
    private pushScene(fileName: string) {
        if (!this.pushSceneNames.includes(fileName)) {
            this.pushSceneNames.push(fileName);
        }
    }

    /**
     * Set scene to be unloaded
     * @param sceneName Scene name of scene to unload
     */
    private killScene(sceneName: string) {
        if(!this.killSceneNames.includes(sceneName)) {
            this.killSceneNames.push(sceneName);
        }
    }

    /** Unload all current scenes */
    public killAllScenes() {
        this.killScenes(this.scenes.map(s => s.name));
    }

    /**
     * Get time since last frame
     * @returns Time since last frame
     */
    private calculateDeltaTime() {
        // Date as milliseconds
        const now = (+new Date);
        // Frames per second, limited between 12 and 240
        const fps = clamp(1000 / (now - this.lastTime), 12, 240);
        // Record timestamp for next frame
        this.lastTime = now;
        // Return delta time, the milliseconds between this frame and the previous frame
        return 1/fps;
    }

    private registerGameObjects(gameObjectTypes: typeof GameObject[]): void {
        for (const GOType of gameObjectTypes) {
            this.gameObjectTypes.set(GOType.name, GOType);
        }
    }
}
