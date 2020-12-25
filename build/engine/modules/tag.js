export default class TagModule {
  constructor() {
    this.scenes = [];
  }
  exists(sceneName) {
    return this.scenes.some((s) => s.name == sceneName);
  }
  pushGO(gameObject, sceneName) {
    var curr = this.scenes.find((sg) => sg.name == sceneName);
    if (curr == null) {
      this.scenes.push({
        name: sceneName,
        tags: [{
          tag: gameObject.tag,
          tagObjects: [gameObject]
        }]
      });
    } else {
      this.pushGOToGroup(gameObject, curr.tags);
    }
  }
  pushGOToGroup(gameObject, tags) {
    var curr = tags.find((gos) => gos.tag == gameObject.tag);
    if (curr == null) {
      tags.push({
        tag: gameObject.tag,
        tagObjects: [gameObject]
      });
    } else {
      curr.tagObjects.push(gameObject);
    }
  }
  get(tag, sceneName) {
    return this.scenes.find((sg) => sg.name == sceneName)?.tags.find((gos) => gos.tag == tag)?.tagObjects || [];
  }
  clear(sceneNames) {
    this.scenes = this.scenes.filter((sg) => !sceneNames.some((sn) => sg.name == sn));
  }
}
//# sourceMappingURL=tag.js.map
