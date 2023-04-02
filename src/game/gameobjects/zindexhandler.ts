import GameObject from "engine/gameobjects/gameobject";
import { col1D, GMULTX, GMULTY } from "engine/utilities/math";
import Vect, { Point } from "engine/utilities/vect";
import Brick from "./brick";
import Character from "./character";

enum ZPointType {
    Brick,
    Char
}

interface ZPoint {
    type : ZPointType,
    gameObject : GameObject,
    pos : Point,
    children : ZPoint[]
}

/** Handler for brick selection, movement, etc. */
export default class ZIndexHandler extends GameObject {

    private zPoints: ZPoint[] = [];

    /** Initalize the brick handler, get related bricks & game objects, manage bricks */
    public init() {
         
        this.engine.tag.get(
            "Brick", 
            "Level").forEach(x => this.zPoints.push({
                type : ZPointType.Brick,
                gameObject : x,
                pos : x.gpos.get(),
                children : []
            }));
         
        this.engine.tag.get(
            "Character", 
            "Level").forEach(x => this.zPoints.push({
                type : ZPointType.Char,
                gameObject : x,
                pos : x.gpos.get(),
                children : []
            }));

        this.zPoints.forEach(z => this.processZPoint(z));
    }

    /** Update, check and modify tree */
    public update() {

        let isUpdate = this.zPoints.some(z => 
            z.pos.x != z.gameObject.gpos.x ||
            z.pos.y != z.gameObject.gpos.y);

        if(isUpdate) {
            this.zPoints.forEach(z => this.processZPoint(z));
        }
    }

    /** Process a zPoint */
    private processZPoint(zPoint : ZPoint) { 

        //Reset
        zPoint.children = [];
        zPoint.pos = zPoint.gameObject.gpos.get();

        //Process point differently depending on its type
        switch(zPoint.type) {

            case ZPointType.Brick :
                zPoint.children = this.processBrick(zPoint.gameObject as Brick);
                break;

            case ZPointType.Char :
                zPoint.children = this.processCharacter(zPoint.gameObject as Character);
                break;
        }
    }

    /** Process and get the zPoints for a Brick Game Object */
    private processBrick(brick : Brick) : ZPoint[] {

        let ret = [] as ZPoint[];
        let width = brick.width;
        let gpos = brick.gpos;

        //Add bricks in front
        ret = ret.concat(
            this.zPoints.filter(bz => 
                bz.type == ZPointType.Brick &&              //Check only bricks
                bz.gameObject.gpos.x == gpos.x + width &&   //Brick is ahead
                bz.gameObject.gpos.y == gpos.y));           //Brick is in row

        //Add characters in front
        ret = ret.concat(
            this.zPoints.filter(cz =>
                cz.type == ZPointType.Char &&                   //Check only characters
                cz.gameObject.gpos.x == gpos.x + width + 1 &&   //Character is ahead
                col1D(                                          //Character is in range
                    gpos.y - 1,
                    gpos.y,
                    cz.gameObject.gpos.y - (cz.gameObject as Character).height,
                    cz.gameObject.gpos.y
                )));
        
        //Add bricks above
        ret = ret.concat(
            this.zPoints.filter(bz =>
                bz.type == ZPointType.Brick &&
                bz.gameObject.gpos.y == gpos.y - 1 &&
                col1D(
                    gpos.x,
                    gpos.x + width,
                    bz.gameObject.gpos.x,
                    bz.gameObject.gpos.x + (bz.gameObject as Brick).width
                )));

        //Add characters above
        ret = ret.concat(
            this.zPoints.filter(cz =>
                cz.type == ZPointType.Char &&
                cz.gameObject.gpos.y == gpos.y - 1 &&
                col1D(
                    gpos.x,
                    gpos.x + width,
                    cz.gameObject.gpos.x - 1,
                    cz.gameObject.gpos.x + 1
                )));

        return ret;
    }

    /** Process and get the zPoints for a Character Game Object */
    private processCharacter(character : Character) : ZPoint[] {

        let ret = [] as ZPoint[];
        let height = character.height;
        let gpos = character.gpos;

        //Add bricks in front
        ret = ret.concat(
            this.zPoints.filter(bz => 
                bz.type == ZPointType.Brick &&              //Check only bricks
                bz.gameObject.gpos.x == gpos.x + 1 &&       //Brick is ahead
                bz.gameObject.gpos.y >= gpos.y &&           //Brick >= height range
                bz.gameObject.gpos.y <= gpos.y - height));  //Brick <= height range

        //Add characters in front
        ret = ret.concat(
            this.zPoints.filter(cz =>
                cz.type == ZPointType.Char &&               //Check only characters
                cz.gameObject.gpos.x == gpos.x + 2 &&       //Character is ahead
                col1D(                                      //Character is in range
                    gpos.y - height,
                    gpos.y,
                    cz.gameObject.gpos.y - (cz.gameObject as Character).height,
                    cz.gameObject.gpos.y
                )));
        
        //Add bricks above
        ret = ret.concat(
            this.zPoints.filter(bz =>
                bz.type == ZPointType.Brick &&
                bz.gameObject.gpos.y == gpos.y - height &&
                col1D(
                    gpos.x - 1,
                    gpos.x + 1,
                    bz.gameObject.gpos.x,
                    bz.gameObject.gpos.x + (bz.gameObject as Brick).width
                )));

        //Add characters above
        ret = ret.concat(
            this.zPoints.filter(cz =>
                cz.type == ZPointType.Char &&
                cz.gameObject.gpos.y == gpos.y - height &&
                col1D(
                    gpos.x - 1,
                    gpos.x + 1,
                    cz.gameObject.gpos.x - 1,
                    cz.gameObject.gpos.x + 1
                )));

        return ret;
    }

    /** Debug Draw */
    public superDraw(ctx : CanvasRenderingContext2D) {

        ctx.globalAlpha = 0.6;
        ctx.lineCap = "round";
        ctx.lineWidth = 3;

        this.zPoints.forEach(z => {

            let offsetZ = this.getDrawPos(z);

            z.children.forEach(c => {

                let offsetC = this.getDrawPos(c);

                let gradient = ctx.createLinearGradient(
                    offsetZ.x, 
                    offsetZ.y, 
                    offsetC.x, 
                    offsetC.y);
                    gradient.addColorStop(0.0, "#000");
                    gradient.addColorStop(1.0, "#000");
                ctx.fillStyle = gradient;

                let angle = Math.atan(-
                    (offsetC.x - offsetZ.x)/
                    (offsetC.y - offsetZ.y));
            
                ctx.beginPath();

                ctx.arc(
                    offsetZ.x,
                    offsetZ.y,
                    4,
                    angle - Math.PI,
                    angle,
                    offsetC.y - offsetZ.y != 0)
                ctx.lineTo(
                    offsetC.x + Math.cos(angle) * 1, 
                    offsetC.y + Math.sin(angle) * 1);
                ctx.lineTo(
                    offsetC.x - Math.cos(angle) * 1, 
                    offsetC.y - Math.sin(angle) * 1);
                ctx.fill();
            })
        });
    }

    /** Get proper position of a zPoint */
    private getDrawPos(zPoint : ZPoint) : Point {

        return new Vect(
            zPoint.gameObject.gpos.x * GMULTX,
            zPoint.gameObject.gpos.y * GMULTY).getAdd( 
            zPoint.type == ZPointType.Brick ? {
                x : (zPoint.gameObject as Brick).width / 2 * GMULTX,
                y : GMULTY / 2
            } : 
            zPoint.type == ZPointType.Char ? {
                x : 0,
                y : (zPoint.gameObject as Character).height / 2 * -GMULTY + GMULTY
            } : {
                x : 0,
                y : 0
            });
    }
}
