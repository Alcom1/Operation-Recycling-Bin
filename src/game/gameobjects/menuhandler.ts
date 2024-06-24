import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import ButtonScene, { ButtonSceneParams } from "./buttonscene";

/** Extend canvas context for letter spacing */
interface Menu_CanvasRenderingContext2D extends CanvasRenderingContext2D {
    letterSpacing : string;
}

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
                        x: cPos.x * 315 + 170,
                        y: cPos.y * 50 + 110
                      },
                      size: {
                        x: 300,
                        y: 32
                    },
                    text: this.engine.scraper.levelNames[i],
                    sceneName: `LEVEL_${String(i).padStart(2, '0')}`
                } as ButtonSceneParams))
        }
    }

    public draw(ctx: Menu_CanvasRenderingContext2D) {

        for(let i = 1; i <= 4; i++) {
        
            ctx.letterSpacing = "3px"
            ctx.fillStyle = "#FFF";
            ctx.font = "40px FontStencil";
            ctx.textAlign = "center";
            ctx.fillText(`BUILDING ${i}`, i * 315 - 140, 70);
        }
    }
}
