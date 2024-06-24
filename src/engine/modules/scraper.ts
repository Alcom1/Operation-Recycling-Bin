import { GameObjectParams } from "engine/gameobjects/gameobject";
import { SceneParams } from "engine/scene/scene";
import { LevelSequenceParams } from "game/gameobjects/levelsequence";

/** Module that scrapes scenes for specific data and stores it */
export default class ScraperModule {

    public levelNames : string[] = [];

    /** Load scene datas */
    loadSceneDatas(scenes : {
        scene: SceneParams;
        gameObjects: GameObjectParams[]
    }[]) {

        //Handle each scene
        scenes.forEach(s => {

            //Get level sequences in numbered levels, store level names indexed by their number
            let levelSequences = s.gameObjects.filter(gop => gop.name == "LevelSequence");
            if(levelSequences.length > 0 && s.scene.tag && s.scene.tag.match(/LEVEL_\d{2}/)) {
                
                let levelSequence = levelSequences[0] as LevelSequenceParams;
                this.levelNames[parseInt(s.scene.tag.split('_')[1])] = levelSequence.levelName;
            }
        })
    }
}
