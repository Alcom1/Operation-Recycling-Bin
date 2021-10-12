import BakerModule from "./modules/baker.js";
import CollisionModule from "./modules/collision.js";
import LibraryModule from "./modules/library.js";
import MouseModule from "./modules/mouse.js";
import TagModule from "./modules/tag.js";
import Scene from "./scene/scene.js";
import {clamp} from "./utilities/math.js";
export default class Engine {
  constructor(element, scenePathName, startScenes, gameObjectTypes, width = 1296, height = 864) {
    this.width = width;
    this.height = height;
    this.lastTime = 0;
    this.animationID = 0;
    this.sceneDatas = [];
    this.scenesActive = [];
    this.scenesLoading = [];
    this.pushSceneNames = [];
    this.killSceneNames = [];
    this.crashed = false;
    this.gameObjectTypes = new Map();
    this.scenePath = scenePathName;
    this.canvas = element;
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.maxWidth = this.canvas.width + "px";
    this.canvas.style.maxHeight = this.canvas.height + "px";
    const ctx = this.canvas.getContext("2d");
    if (!ctx)
      throw new Error("Unable to acquire WebGL context");
    this.ctx = ctx;
    this.baker = new BakerModule(this.canvas);
    this.collision = new CollisionModule();
    this.library = new LibraryModule();
    this.mouse = new MouseModule(this.canvas);
    this.mouse.setResolution(this.canvas.width, this.canvas.height);
    this.tag = new TagModule();
    this.registerGameObjects(gameObjectTypes);
    this.pushSceneNames = ["LevelInterface", "LEVEL_53"];
    this.loadScenes(startScenes, this.scenesActive).finally(() => {
      this.frame();
    });
  }
  frame() {
    this.animationID = requestAnimationFrame(() => {
      if (this.crashed)
        return;
      try {
        this.frame();
      } catch (e) {
        this.crashed = true;
        throw e;
      }
    });
    const dt = this.calculateDeltaTime();
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.unloadScenes(this.killSceneNames);
    this.pushSceneNames.map((sn) => this.loadScene(sn, this.scenesActive));
    this.pushSceneNames = [];
    if (this.library.getLoaded()) {
      this.initScenes();
      this.updateDrawScenes(this.scenesActive, dt);
    } else {
      this.updateDrawScenes(this.scenesLoading, dt);
    }
    this.mouse.update();
  }
  initScenes() {
    this.collision.update();
    this.scenesLoading.forEach((s) => s.init(this.ctx, this.scenesActive));
    this.scenesActive.forEach((s) => s.init(this.ctx, this.scenesActive));
  }
  updateDrawScenes(scenes, dt) {
    scenes.forEach((s) => s.update(dt));
    scenes.forEach((s) => s.draw(this.ctx));
    scenes.forEach((s) => s.superDraw(this.ctx));
  }
  async loadScenes(sceneName, scenes) {
    const sceneResponse = await fetch(`${this.scenePath}${sceneName}.json`);
    this.sceneDatas = await sceneResponse.json();
  }
  loadScene(sceneName, scenes) {
    const sceneData = this.sceneDatas.find((s) => s.scene.tag == sceneName);
    if (sceneData) {
      const scene2 = new Scene(this, sceneData.scene);
      for (const goData of sceneData.gameObjects) {
        const GOType = this.gameObjectTypes.get(goData.name);
        if (!GOType)
          throw new Error(`GameObject of type ${goData.name} does not exist`);
        const go = new GOType(this, {...goData, scene: scene2});
        scene2.pushGO(go);
        this.tag.pushGO(go, scene2.name);
      }
      scene2.sortGO();
      scenes.push(scene2);
      scenes.sort((a, b) => a.zIndex - b.zIndex);
    } else {
      throw new Error(`Scene with tag ${sceneName} does not exist`);
    }
  }
  unloadScenes(killSceneNames) {
    if (killSceneNames.length > 1) {
      this.scenesActive = this.scenesActive.filter((s) => !this.killSceneNames.includes(s.name));
      this.tag.clear(this.killSceneNames);
      this.collision.clear(this.killSceneNames);
      this.killSceneNames = [];
    }
  }
  pushScenes(fileNames) {
    if (Array.isArray(fileNames)) {
      fileNames.forEach((s) => this.pushScene(s));
    } else {
      this.pushScene(fileNames);
    }
  }
  killScenes(sceneNames) {
    if (Array.isArray(sceneNames)) {
      sceneNames.forEach((s) => this.killScene(s));
    } else {
      this.killScene(sceneNames);
    }
  }
  pushScene(fileName) {
    if (!this.pushSceneNames.includes(fileName)) {
      this.pushSceneNames.push(fileName);
    }
  }
  killScene(sceneName) {
    if (!this.killSceneNames.includes(sceneName)) {
      this.killSceneNames.push(sceneName);
    }
  }
  killAllScenes() {
    this.killScenes(this.scenesActive.map((s) => s.name));
  }
  calculateDeltaTime() {
    const now = +new Date();
    const fps = clamp(1e3 / (now - this.lastTime), 12, 240);
    this.lastTime = now;
    return 1 / fps;
  }
  registerGameObjects(gameObjectTypes) {
    for (const GOType of gameObjectTypes) {
      this.gameObjectTypes.set(GOType.name, GOType);
    }
  }
}
//# sourceMappingURL=engine.js.map
