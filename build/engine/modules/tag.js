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
      gameObject.tags.forEach((tag) => {
        this.scenes.push({
          name: sceneName,
          tags: [{
            tag,
            tagObjects: [gameObject]
          }]
        });
      });
    } else {
      this.pushGOToGroup(gameObject, curr.tags);
    }
  }
  pushGOToGroup(gameObject, tagGroups) {
    gameObject.tags.forEach((tag) => {
      var curr = tagGroups.find((tg) => tag == tg.tag);
      if (curr == null) {
        tagGroups.push({
          tag,
          tagObjects: [gameObject]
        });
      } else {
        curr.tagObjects.push(gameObject);
      }
    });
  }
  get(tag, sceneName) {
    return this.scenes.find((sg) => sg.name == sceneName)?.tags.filter((gos) => Array.isArray(tag) ? tag.includes(gos.tag) : gos.tag == tag)?.flatMap((t) => t.tagObjects) ?? [];
  }
  clear(sceneNames) {
    this.scenes = this.scenes.filter((sg) => !sceneNames.some((sn) => sg.name == sn));
  }
}
//# sourceMappingURL=tag.js.map
