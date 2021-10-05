import GameObject from "engine/gameobjects/gameobject";

interface TagGroup {
    tag: string;
    tagObjects: GameObject[];
}

interface TaggedScene {
    name: string;
    tags: TagGroup[];
}

/** Module that handles tags and game objects grouped by tag. */
export default class TagModule {
    private scenes: TaggedScene[] = [];

    /** Return true if a scene by name exists in the scene. */
    public exists(sceneName: string): boolean {
        return this.scenes.some(s => s.name == sceneName);
    }

    /** Push a game object to the scene */
    public pushGO(gameObject: GameObject, sceneName: string): void {
        // Get scene with name
        var curr = this.scenes.find(sg => sg.name == sceneName );

        // Store new scene or push gameObject to existing scene  
        if(curr == null) {
            gameObject.tags.forEach(tag => {
                this.scenes.push({
                    name : sceneName,
                    tags : [{
                        tag : tag,
                        tagObjects : [gameObject]
                    }]
                });
            });
        }
        else {
            this.pushGOToGroup(gameObject, curr.tags);
        }
    }

    /** Push a game object to the tag */
    private pushGOToGroup(gameObject: GameObject, tagGroups: TagGroup[]): void {
        // Get tag with game object's name
        var curr = tagGroups.find(tg => gameObject.tags.some(t => t == tg.tag));

        // Store new tag or push gameObject to existing tag
        if (curr == null) {
            gameObject.tags.forEach(tag => {
                tagGroups.push({
                    tag : tag,
                    tagObjects : [gameObject]
                });
            });
        } else {
            curr.tagObjects.push(gameObject);
        }
    }

    /** Returns all game objects for the given tag(s) and scene name */
    public get(tag: string | string[], sceneName: string): GameObject[] {

        return this.scenes.find(
            sg => sg.name == sceneName
        )?.tags.filter(
            gos => Array.isArray(tag) ? tag.includes(gos.tag) : gos.tag == tag
        )?.flatMap(t => t.tagObjects) ?? [];
    }

    /** Remove scenes with names in the provided list */
    public clear(sceneNames: string[]) {
        this.scenes = this.scenes.filter(sg => !sceneNames.some(sn => sg.name == sn));
    }
}
