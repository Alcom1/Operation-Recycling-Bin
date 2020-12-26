import BakerModule from "./modules/baker.js";
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
    this.scenes = [];
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
    this.mouse = new MouseModule(this.canvas);
    this.mouse.setResolution(this.canvas.width, this.canvas.height);
    this.tag = new TagModule();
    this.registerGameObjects(gameObjectTypes);
    startScenes.forEach((s) => this.loadScene(s));
    this.frame();
  }
  async frame() {
    this.animationID = requestAnimationFrame(() => {
      if (this.crashed)
        return;
      this.frame().catch((e) => {
        this.crashed = true;
        throw e;
      });
    });
    const dt = this.calculateDeltaTime();
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.unloadScenes(this.killSceneNames);
    await this.pushSceneNames.map((sn) => this.loadScene(sn));
    this.pushSceneNames = [];
    this.initScenes();
    this.updateScenes(dt);
    this.drawScenes();
    this.mouse.update();
  }
  initScenes() {
    this.scenes.forEach((s) => s.init(this.ctx, this.scenes));
  }
  updateScenes(dt) {
    this.scenes.forEach((s) => s.update(dt));
  }
  drawScenes() {
    this.scenes.forEach((s) => s.draw(this.ctx));
  }
  sortScenes() {
    this.scenes.sort((a, b) => a.zIndex - b.zIndex);
  }
  async loadScene(sceneName) {
    const sceneResponse = await fetch(`${this.scenePath}${sceneName}.json`);
    const sceneData = await sceneResponse.json();
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
    this.scenes.push(scene2);
    this.sortScenes();
  }
  unloadScenes(killSceneNames) {
    if (killSceneNames.length > 1) {
      this.scenes = this.scenes.filter((s) => !this.killSceneNames.includes(s.name));
      this.tag.clear(this.killSceneNames);
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
    this.killScenes(this.scenes.map((s) => s.name));
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
