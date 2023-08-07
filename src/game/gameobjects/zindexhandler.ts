import GameObject from "engine/gameobjects/gameobject";
import { col1D, GMULTX, GMULTY } from "engine/utilities/math";
import Vect, { Point } from "engine/utilities/vect";

interface ZPoint {
    gameObject : GameObject,
    zpos : Point,
    size : Point,
    state : Boolean
}

/** Handler for brick selection, movement, etc. */
export default class ZIndexHandler extends GameObject {

    private zPoints : ZPoint[] = [];
    private get zPointsActive() : ZPoint[] { return this.zPoints.filter(z => z.state) }
    private zEdges : ZPoint[][] = [];
    private debug : Boolean = false;

    /** Initalize the brick handler, get related bricks & game objects, manage bricks */
    public init() {

        this.engine.tag.get(
            ["Brick","Character","Stud","Wind","Misc"],         // Z-sort for these tags...
            "Level").filter(x => {
                return x.tags.every(x => x != "BrickPhantom");  // But not these tags.
            }).forEach(o => 
                this.zPoints.push({
                    gameObject : o,
                    zpos : o.zpos.get(),
                    size : o.zSize,
                    state : o.zState
                }));

        this.processZPoints();
    }

    /** Update, check and modify tree */
    public update() {

        let isUpdate = this.zPoints.some(p => 
            p.zpos.x != p.gameObject.zpos.x ||
            p.zpos.y != p.gameObject.zpos.y ||
            p.state != p.gameObject.zState);

        if(isUpdate) {
            this.processZPoints();
        }
    }

    /** Process all zPoints */
    private processZPoints() {

        this.zEdges = [];
        
        //Setup zpoints for current state
        this.zPoints.forEach(z => {
            z.zpos = z.gameObject.zpos.get()
            z.state = z.gameObject.zState;
        });
        
        //Compare z-points and get the edges between them
        this.zEdges = this.zPointsActive.flatMap(z => this.process(z).map(b => [z, b]));

        //Set z-indicies based on sorted array indicies
        this.topologicalSort().forEach((z, i) => {
            z.gameObject.zIndex = i;
        });
    }

    /** Process a single zPoint */
    private process(c : ZPoint) : ZPoint[] {

        let ret = [] as ZPoint[];

        //Game Objects in front
        ret = ret.concat(this.zPointsActive.filter(o => {

            let isFront = c.zpos.x + c.size.x == o.zpos.x;

            //Y-Overlap
            let cZposy = c.zpos.y + (c.size.y == 0 ? 1 : 0);    //Treat flat objects as 1 lower.
            let oZposy = o.zpos.y + (o.size.y == 0 ? 1 : 0);    //Treat flat objects as 1 lower.
            let overlapY = col1D(
                cZposy,
                cZposy + c.size.y + 0.1,
                oZposy,
                oZposy + o.size.y + 0.1);

            return isFront && overlapY;
        }));

        //Game Objects above
        ret = ret.concat(this.zPointsActive.filter(o => {

            //Never sort with self
            if(c === o) {
                return false;
            }

            //Other game object is above
            let isAbove = c.size.y > 0 ?
                c.zpos.y - o.zpos.y > 0 :
                c.zpos.y - o.zpos.y >= 0;

            //X-Overlap
            let overlapX = col1D(
                c.zpos.x, 
                c.zpos.x + c.size.x, 
                o.zpos.x, 
                o.zpos.x + o.size.x);

            //Y-Overlap
            let cZposy = c.zpos.y + (c.size.y == 0 ? 1 : 0);    //Treat flat objects as 1 lower.
            let oZposy = o.zpos.y + (o.size.y == 0 ? 1 : 0);    //Treat flat objects as 1 lower.
            let overlapY = col1D(
                cZposy,
                cZposy + c.size.y + 0.1,
                oZposy,
                oZposy + o.size.y + 0.1);

            return isAbove && overlapX && overlapY;
        }));

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

        if(this.zEdges.length == 1) {
            console.log(this.zEdges[0][1].zpos.x);
        }

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

        return "#000";
    }

    /** Get proper position of a zPoint */
    private getDrawPos(zPoint : ZPoint) : Point {

        return new Vect(
            GMULTX * (zPoint.gameObject.zpos.x + zPoint.size.x / 2),
            GMULTY * (zPoint.gameObject.zpos.y + zPoint.size.y / 2));
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

