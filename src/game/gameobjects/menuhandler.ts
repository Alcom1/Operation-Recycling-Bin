import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import ButtonScene, { ButtonSceneParams } from "./buttonscene";

/** Handler for brick selection, movement, etc. */
export default class MenuHandler extends GameObject {

    private buttonRowCount = 15;

    /** Constructor */
    constructor(params: GameObjectParams) {
        super(params);

        for(let i = 1; i <= 60; i++) {

            let cPos = { 
                x : Math.floor((i - 1) / this.buttonRowCount), 
                y : (i - 1) % this.buttonRowCount
            }

            // Create top sprite
            this.parent.pushGO(
                new ButtonScene({
                    ...params,
                    tags: ["Button"],
                    subPosition: {
                        x: cPos.x * 250 + 250,
                        y: cPos.y * 50 + 80
                      },
                      size: {
                        x: 200,
                        y: 32
                    },
                    text: `Level ${i}`,
                    sceneName: `LEVEL_${String(i).padStart(2, '0')}`
                } as ButtonSceneParams))
        }
    }
}
