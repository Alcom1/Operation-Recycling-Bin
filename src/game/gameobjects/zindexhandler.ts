import GameObject from "engine/gameobjects/gameobject";
import { col1D, GMULTX, GMULTY, Z_DEPTH } from "engine/utilities/math";
import Vect, { Point } from "engine/utilities/vect";
import Anim from "./anim";
import Brick from "./brick";
import Character from "./character";
import Stud from "./stud";

enum ZPointType {
    Brick,
    Studs,
    Char,
    //Water,
    //Earth,
    //Fire,
    Air
}

interface ZPoint {
    type : ZPointType,
    gameObject : GameObject,
    pos : Point,
    state : Boolean
}

/** Handler for brick selection, movement, etc. */
export default class ZIndexHandler extends GameObject {

    private zPoints : ZPoint[] = [];
    private zEdges : ZPoint[][] = [];
    private debug : Boolean = true;

    /** Initalize the brick handler, get related bricks & game objects, manage bricks */
    public init() {
         
        this.engine.tag.get(
            "Brick", 
            "Level").forEach(o => 
                this.zPoints.push({
                    type : ZPointType.Brick,
                    gameObject : o,
                    pos : o.zpos.get(),
                    state : o.zState
                }));
         
        this.engine.tag.get(
            "Character", 
            "Level").forEach(o => 
                this.zPoints.push({
                    type : ZPointType.Char,
                    gameObject : o,
                    pos : o.zpos.get(),
                    state : o.zState
                }));
         
        this.engine.tag.get(
            "Stud", 
            "Level").forEach(o => 
                this.zPoints.push({
                    type : ZPointType.Studs,
                    gameObject : o,
                    pos : o.zpos.get(),
                    state : o.zState
                }));
         
        this.engine.tag.get(
            "Wind", 
            "Level").forEach(o => 
                this.zPoints.push({
                    type : ZPointType.Air,
                    gameObject : o,
                    pos : o.zpos.get(),
                    state : o.zState
                }));

        this.processZPoints();
    }

    /** Update, check and modify tree */
    public update() {

        let isUpdate = this.zPoints.some(p => 
            p.pos.x != p.gameObject.zpos.x ||
            p.pos.y != p.gameObject.zpos.y ||
            p.state != p.gameObject.zState);

        if(isUpdate) {
            this.processZPoints();
        }
    }

    /** Process all zPoints */
    private processZPoints() {

        this.zEdges = [];
        this.zPoints.forEach(z => this.processZPoint(z));

        //Set z-indicies based on sorted array indicies
        this.topologicalSort().forEach((z, i) => {
            z.gameObject.zIndex = i;
        });
    }

    /** Process a zPoint */
    private processZPoint(zPoint : ZPoint) { 

        //Reset
        zPoint.pos = zPoint.gameObject.zpos.get();
        zPoint.state = zPoint.gameObject.zState;

        //Process point differently depending on its type
        switch(zPoint.type) {

            case ZPointType.Brick :
                this.zEdges = this.zEdges.concat(this.processBrick(zPoint.gameObject as Brick).map(b => [zPoint, b]));
                break;

            case ZPointType.Studs :
                this.zEdges = this.zEdges.concat(this.processStud(zPoint.gameObject as Stud).map(s => [zPoint, s]));
                break

            case ZPointType.Char :
                this.zEdges = this.zEdges.concat(this.processCharacter(zPoint.gameObject as Character).map(c => [zPoint, c]));
                break;

            case ZPointType.Air :
                this.zEdges = this.zEdges.concat(this.processWind(zPoint.gameObject as Anim).map(c => [zPoint, c]));
                break;
        }
    }

    /** Process and get the zPoints for a Brick Game Object */
    private processBrick(brick : Brick) : ZPoint[] {

        let ret = [] as ZPoint[];
        let width = brick.width;
        let zpos = brick.zpos;

        //Add bricks in front
        ret = ret.concat(
            this.zPoints.filter(bz => 
                bz.type == ZPointType.Brick &&              //Check only bricks
                bz.gameObject.zpos.x == zpos.x + width &&   //Brick is ahead
                bz.gameObject.zpos.y == zpos.y));           //Brick is in row

        //Add studs in front
        ret = ret.concat(
            this.zPoints.filter(bz => 
                bz.type == ZPointType.Studs &&              //Check only studs
               (bz.gameObject as Stud).isVisible &&
                bz.gameObject.zpos.x == zpos.x + width &&   //stud is ahead
                bz.gameObject.zpos.y == zpos.y));           //stud is in row

        //Add characters in front
        ret = ret.concat(
            this.zPoints.filter(cz =>
                cz.type == ZPointType.Char &&                   //Check only characters
                cz.gameObject.zpos.x >= zpos.x + width + 1 &&   //Character is ahead
                cz.gameObject.zpos.x <= zpos.x + width + 2 &&   //Character is ahead
                col1D(                                          //Character is in range
                    zpos.y - 1,
                    zpos.y,
                    cz.gameObject.zpos.y - (cz.gameObject as Character).height,
                    cz.gameObject.zpos.y
                )));

        //Add wind in front
        ret = ret.concat(
            this.zPoints.filter(bz => 
                bz.type == ZPointType.Air &&                //Check only studs
                bz.gameObject.zpos.x == zpos.x + width &&   //stud is ahead
                bz.gameObject.zpos.y == zpos.y));           //stud is in row
        
        //Add bricks above
        ret = ret.concat(
            this.zPoints.filter(bz =>
                bz.type == ZPointType.Brick &&
                col1D(
                    zpos.x,
                    zpos.x + width + 1,
                    bz.gameObject.zpos.x,
                    bz.gameObject.zpos.x + (bz.gameObject as Brick).width
                ) &&
                bz.gameObject.zpos.y == zpos.y - 1));

        //Add studs above
        ret = ret.concat(
            this.zPoints.filter(bz =>
                bz.type == ZPointType.Studs &&
               (bz.gameObject as Stud).isVisible &&
                bz.gameObject.zpos.y == zpos.y - 1 &&
                col1D(
                    zpos.x,
                    zpos.x + width,
                    bz.gameObject.zpos.x,
                    bz.gameObject.zpos.x + 1
                )));

        //Add characters above
        ret = ret.concat(
            this.zPoints.filter(cz =>
                cz.type == ZPointType.Char &&
                cz.gameObject.zpos.y == zpos.y - 1 &&
                col1D(
                    zpos.x,
                    zpos.x + width,
                    cz.gameObject.zpos.x - 1,
                    cz.gameObject.zpos.x + 1
                )));

        //Add wind in above (Should only apply to fan bricks but whatever)
        ret = width != 4 ? ret : ret.concat(
            this.zPoints.filter(bz => 
                bz.type == ZPointType.Air &&            //Check only wind
                bz.gameObject.zpos.x >= zpos.x + 1 &&   //wind is above
                bz.gameObject.zpos.x <= zpos.x + 2 &&   //wind is above
                bz.gameObject.zpos.y == zpos.y - 1));   //wind is above

        return ret;
    }

    /** Process brick studs */
    private processStud(stud : Stud) : ZPoint[] {

        //Ignore invisible studs
        if(!stud.isVisible) {
            return [];
        }

        let ret = [] as ZPoint[];
        let zpos = stud.zpos;

        //Add brick in front
        ret = ret.concat(this.zPoints.filter(bz => 
            bz.type == ZPointType.Brick &&              //Check only bricks
            bz.gameObject.zpos.x == zpos.x + 1 &&       //Brick is ahead
            bz.gameObject.zpos.y == zpos.y));

        //Add characters in front
        ret = ret.concat(
            this.zPoints.filter(cz =>
                cz.type == ZPointType.Char &&           //Check only characters
                cz.gameObject.zpos.x >= zpos.x + 2 &&   //Character is ahead
                cz.gameObject.zpos.x <= zpos.x + 3 &&   //Character is ahead
                col1D(                                  //Character is in range
                    zpos.y - 1,
                    zpos.y,
                    cz.gameObject.zpos.y - (cz.gameObject as Character).height,
                    cz.gameObject.zpos.y
                )));

        //Add wind in front
        ret = ret.concat(
            this.zPoints.filter(bz => 
                bz.type == ZPointType.Air &&            //Check only wind
                bz.gameObject.zpos.x == zpos.x + 1 &&   //wind is ahead
                bz.gameObject.zpos.y == zpos.y));       //wind is in row
        
        //Add bricks on top (Transparent bricks, also jump bricks for some reason)
        ret = ret.concat(
            this.zPoints.filter(bz =>
                bz.type == ZPointType.Brick &&
                col1D(
                    zpos.x,
                    zpos.x + 1,
                    bz.gameObject.zpos.x,
                    bz.gameObject.zpos.x + (bz.gameObject as Brick).width
                ) &&
                bz.gameObject.zpos.y == zpos.y));

        return ret;
    }

    /** Process and get the zPoints for a Character Game Object */
    private processCharacter(character : Character) : ZPoint[] {

        let ret = [] as ZPoint[];
        let height = character.height;
        let zpos = character.zpos;

        //Add bricks in front
        ret = ret.concat(
            this.zPoints.filter(bz => 
                bz.type == ZPointType.Brick &&              //Check only bricks
                bz.gameObject.zpos.x >= zpos.x + 1 &&       //Brick is ahead
                bz.gameObject.zpos.x <= zpos.x + 2 &&       //Brick is ahead
                bz.gameObject.zpos.y <= zpos.y &&           //Brick >= height range
                bz.gameObject.zpos.y >= zpos.y - height));  //Brick <= height range

        //Add characters in front
        ret = ret.concat(
            this.zPoints.filter(cz =>
                cz.type == ZPointType.Char &&               //Check only characters
                cz.gameObject.zpos.x == zpos.x + 2 &&       //Character is ahead
                col1D(                                      //Character is in range
                    zpos.y - height,
                    zpos.y,
                    cz.gameObject.zpos.y - (cz.gameObject as Character).height,
                    cz.gameObject.zpos.y
                )));
        
        //Add bricks above
        ret = ret.concat(
            this.zPoints.filter(bz =>
                bz.type == ZPointType.Brick &&
                bz.gameObject.zpos.y == zpos.y - height &&
                col1D(
                    zpos.x - 1,
                    zpos.x + 1,
                    bz.gameObject.zpos.x,
                    bz.gameObject.zpos.x + (bz.gameObject as Brick).width
                )));

        //Add characters above
        ret = ret.concat(
            this.zPoints.filter(cz =>
                cz.type == ZPointType.Char &&
                cz.gameObject.zpos.y == zpos.y - height &&
                col1D(
                    zpos.x - 1,
                    zpos.x + 1,
                    cz.gameObject.zpos.x - 1,
                    cz.gameObject.zpos.x + 1
                )));

        return ret;
    }

    /** Process and get the zPoints for a Wind animation */
    private processWind(wind : Anim) : ZPoint[] {

        let ret = [] as ZPoint[];
        let zpos = wind.zpos;

        //Add brick in front
        ret = ret.concat(this.zPoints.filter(bz => 
            bz.type == ZPointType.Brick &&              //Check only bricks
            bz.gameObject.zpos.x == zpos.x + 1 &&       //Brick is ahead
            bz.gameObject.zpos.y == zpos.y));

        //Add characters in front
        ret = ret.concat(
            this.zPoints.filter(cz =>
                cz.type == ZPointType.Char &&           //Check only characters
                cz.gameObject.zpos.x == zpos.x + 2 &&   //Character is ahead
                col1D(                                  //Character is in range
                    zpos.y - 1,
                    zpos.y,
                    cz.gameObject.zpos.y - (cz.gameObject as Character).height,
                    cz.gameObject.zpos.y
                )));
        
        //Add bricks on top (Transparent bricks, also jump bricks for some reason)
        ret = ret.concat(
            this.zPoints.filter(bz =>
                bz.type == ZPointType.Brick &&
                col1D(
                    zpos.x,
                    zpos.x + 1,
                    bz.gameObject.zpos.x,
                    bz.gameObject.zpos.x + (bz.gameObject as Brick).width
                ) &&
                bz.gameObject.zpos.y == zpos.y));
        
        return ret;
    }

    /** Debug Draw */
    public superDraw(ctx : CanvasRenderingContext2D) {

        if (!this.debug) {
            return;
        }

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
            "#FFF");
    }

    /** Get proper position of a zPoint */
    private getDrawPos(zPoint : ZPoint) : Point {

        return new Vect(
            zPoint.gameObject.zpos.x * GMULTX,
            zPoint.gameObject.zpos.y * GMULTY).getAdd( 
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
            } : 
            zPoint.type == ZPointType.Air ? {
                x : Z_DEPTH,
                y : GMULTY / 2
            } : 
            {
                x : GMULTX,
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

