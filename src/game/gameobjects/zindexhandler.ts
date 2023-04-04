import GameObject from "engine/gameobjects/gameobject";
import { col1D, GMULTX, GMULTY } from "engine/utilities/math";
import Vect, { Point } from "engine/utilities/vect";
import Brick from "./brick";
import Character from "./character";
import Stud from "./stud";

enum ZPointType {
    Brick,
    Studs,
    Char
}

interface ZPoint {
    type : ZPointType,
    gameObject : GameObject,
    pos : Point
}

/** Handler for brick selection, movement, etc. */
export default class ZIndexHandler extends GameObject {

    private zPoints : ZPoint[] = [];
    private zEdges : ZPoint[][] = [];

    /** Initalize the brick handler, get related bricks & game objects, manage bricks */
    public init() {
         
        this.engine.tag.get(
            "Brick", 
            "Level").forEach(x => 
                this.zPoints.push({
                    type : ZPointType.Brick,
                    gameObject : x,
                    pos : x.gpos.get()
                }));
         
        this.engine.tag.get(
            "Character", 
            "Level").forEach(x => 
                this.zPoints.push({
                    type : ZPointType.Char,
                    gameObject : x,
                    pos : x.gpos.get()
                }));
         
        this.engine.tag.get(
            "Stud", 
            "Level").forEach(x => 
                this.zPoints.push({
                    type : ZPointType.Studs,
                    gameObject : x,
                    pos : x.gpos.get()
                }));

        this.processZPoints();
    }

    /** Update, check and modify tree */
    public update() {

        let isUpdate = this.zPoints.some(z => 
            z.pos.x != z.gameObject.gpos.x ||
            z.pos.y != z.gameObject.gpos.y);

        if(isUpdate) {
            this.processZPoints();
        }
    }

    /** Process all zPoints */
    private processZPoints() {

        this.zEdges = [];
        this.zPoints.forEach(z => this.processZPoint(z));

        let qq : ZPoint[] = this.topologicalSort();

        qq.forEach((z, i) => {
            z.gameObject.zIndex = i;
        });
    }

    /** Process a zPoint */
    private processZPoint(zPoint : ZPoint) { 

        //Reset
        zPoint.pos = zPoint.gameObject.gpos.get();

        //Process point differently depending on its type
        switch(zPoint.type) {

            case ZPointType.Brick :
                this.zEdges = this.zEdges.concat(this.processBrick(zPoint.gameObject as Brick).map(b => [zPoint, b]));
                break;

            case ZPointType.Studs :
                this.zEdges = this.zEdges.concat(this.processStuds(zPoint.gameObject as Stud).map(s => [zPoint, s]));
                break

            case ZPointType.Char :
                this.zEdges = this.zEdges.concat(this.processCharacter(zPoint.gameObject as Character).map(c => [zPoint, c]));
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

        //Add studs in front
        ret = ret.concat(
            this.zPoints.filter(bz => 
                bz.type == ZPointType.Studs &&              //Check only studs
               (bz.gameObject as Stud).isVisible &&
                bz.gameObject.gpos.x == gpos.x + width &&   //stud is ahead
                bz.gameObject.gpos.y == gpos.y));           //stud is in row

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
                    gpos.x + width + 1,
                    bz.gameObject.gpos.x,
                    bz.gameObject.gpos.x + (bz.gameObject as Brick).width
                )));

        //Add studs above
        ret = ret.concat(
            this.zPoints.filter(bz =>
                bz.type == ZPointType.Studs &&
               (bz.gameObject as Stud).isVisible &&
                bz.gameObject.gpos.y == gpos.y - 1 &&
                col1D(
                    gpos.x,
                    gpos.x + width,
                    bz.gameObject.gpos.x,
                    bz.gameObject.gpos.x + 1
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

    /** Process brick studs */
    private processStuds(stud : Stud) : ZPoint[] {

        stud.zIndex = 0;

        if(!stud.isVisible) {
            return [];
        }

        let ret = [] as ZPoint[];
        let gpos = stud.gpos;

        //Add brick in front
        ret = ret.concat(this.zPoints.filter(bz => 
            bz.type == ZPointType.Brick &&              //Check only bricks
            bz.gameObject.gpos.x == gpos.x + 1 &&       //Brick is ahead
            bz.gameObject.gpos.y == gpos.y));

        //Add characters in front
        ret = ret.concat(
            this.zPoints.filter(cz =>
                cz.type == ZPointType.Char &&           //Check only characters
                cz.gameObject.gpos.x == gpos.x + 2 &&   //Character is ahead
                col1D(                                  //Character is in range
                    gpos.y - 1,
                    gpos.y,
                    cz.gameObject.gpos.y - (cz.gameObject as Character).height,
                    cz.gameObject.gpos.y
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
                bz.gameObject.gpos.y <= gpos.y &&           //Brick >= height range
                bz.gameObject.gpos.y >= gpos.y - height));  //Brick <= height range

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

        this.zEdges.forEach(e => {

            let offsetZ = this.getDrawPos(e[0]);
            let offsetC = this.getDrawPos(e[1]);

            let gradient = ctx.createLinearGradient(
                offsetZ.x, 
                offsetZ.y, 
                offsetC.x, 
                offsetC.y);
                gradient.addColorStop(0.0, this.getDrawColor(e[0]));
                gradient.addColorStop(1.0, this.getDrawColor(e[1]));
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
        });
    }

    /** Get proper color of a zPoint */
    private getDrawColor(zPoint : ZPoint) : string {
        return (
            zPoint.type == ZPointType.Brick ? "#000" :
            zPoint.type == ZPointType.Studs ? "#0F0" :
            zPoint.type == ZPointType.Char  ? "#00F" :
            "#F00");
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
            zPoint.type == ZPointType.Studs ? {
                x : GMULTX,
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

    /** Kahn's algorithm! */
    private topologicalSort() : ZPoint[] {

        const sorted : ZPoint[] = [];   //Final sorted
        const starts : ZPoint[] = [];   //Starting & curret set of points

        //Creat map of points an their quantity of back edges
        const leads = new Map(this.zPoints.map(z => [z, this.zEdges.filter(e => e[1] === z).length]));
        leads.forEach((q, p) => {
            if(q === 0) {
                starts.push(p);
            }
        })

        //While there are points with zero back edges
        while(starts.length > 0) {

            //Add current point
            let curr = starts.shift()!;
            sorted.push(curr);

            //Subtract all back edges from the points in front
            this.zEdges.filter(e => e[0] === curr).forEach(e => {
                leads.set(e[1], leads.get(e[1])! - 1)

                //If point has no more back edges, add it.
                if(leads.get(e[1]) == 0) {
                    starts.push(e[1]);
                }
            })
        }
      
        return sorted;
    }
}

