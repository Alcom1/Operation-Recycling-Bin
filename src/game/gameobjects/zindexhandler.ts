import GameObject from "engine/gameobjects/gameobject";
import { BOUNDARY, col1D, gap1D, GMULTX, GMULTY } from "engine/utilities/math";
import Vect, { Point } from "engine/utilities/vect";

interface ZPoint {
    gameObject : GameObject,
    pos : Point,
    size : Point,
    flat : Boolean,
    state : Boolean,
    layer : Number,
    noCompare : Boolean
}

/** Handler for brick selection, movement, etc. */
export default class ZIndexHandler extends GameObject {

    private zPoints : ZPoint[] = [];
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
                    pos : this.getTrueZpos(o.zpos, o.zSize.y == 0),
                    size : this.getTrueZsize(o.zSize),
                    flat : o.zSize.y == 0,
                    state : o.zState,
                    layer : o.zLayer,
                    noCompare : o.zNoCompare
                }));

        this.processZPoints();
    }

    /** Update, check and modify tree */
    public update() {
        this.processZPoints();
    }

    /** Process all zPoints */
    private processZPoints() {
        
        //Setup zpoints for current state
        this.zPoints.forEach(z => {
            z.pos = this.getTrueZpos(z.gameObject.zpos, z.flat);
            z.state = z.gameObject.zState;
            z.layer = z.gameObject.zLayer;
            z.size = this.getTrueZsize(z.gameObject.zSize);
        });

        let zPointsActive = this.zPoints.filter(z => z.state);

        let zEdges : ZPoint[][] = [];

        zPointsActive.forEach(z1 => {
            zPointsActive.forEach(z2 => {
                if (this.checkValidComparison(z1, z2) && (
                    this.processAbove(z1, z2) || 
                    this.processFront(z1, z2))) {
                    
                    zEdges.push([z1, z2]);
                }
            })
        });

        //Set z-indicies based on sorted array indicies
        this.topologicalSort(zPointsActive, zEdges).forEach((z, i) => {
            z.gameObject.zIndex = i;
        });
    }

    /** Get the true z-position of a zpoint*/
    private getTrueZpos(zpos : Vect, flat : Boolean) : Vect {

        return new Vect(zpos.x, zpos.y * 2 - (flat ? 0 : 1));
    }

    /** Get the true z-position of a zpoint*/
    private getTrueZsize(zsize : Point) : Vect {

        return new Vect(zsize.x, Math.max(zsize.y * 2, 1));
    }

    /** */
    private processAbove(c : ZPoint, o : ZPoint) : boolean {

        //Is above
        if (c.pos.y <= o.pos.y) {

            return false;
        }

        //Is aligned
        if (!col1D(
            c.pos.x,
            c.pos.x + c.size.x,
            o.pos.x,
            o.pos.x + o.size.x)) {

            return false;
        }

        //Distance
        if (gap1D(
            o.pos.y,
            o.pos.y + o.size.y,
            c.pos.y,
            c.pos.y + c.size.y) > 1) {

            return false;
        }

        return true;
    }

    /** */
    private processFront(c : ZPoint, o : ZPoint) : boolean {

        //Is ahead
        if (c.pos.x >= o.pos.x) {

            return false;
        }

        //Is aligned
        if (!col1D(
            c.pos.y,
            c.pos.y + c.size.y,
            o.pos.y,
            o.pos.y + o.size.y)) {

            return false;
        }

        //Distance
        let distance = gap1D(
            c.pos.x,
            c.pos.x + c.size.x,
            o.pos.x,
            o.pos.x + o.size.x);

        if (distance > 1 ||             //Other object is close
           (o.flat && distance < 0)) {  //Overlapping with flat objects does not mean they're in front.
            
            return false;
        }

        return true;
    }

    /** returns true if a comparison is valid */
    public checkValidComparison(a : ZPoint, b : ZPoint) : Boolean {
        
        //Never sort with self
        if(a === b) {
            return false;
        }
        
        //Never sort two objects marked NOCOMPARE
        if(a.noCompare && b.noCompare) {
            return false;
        }

        //Never sort two objects on different layers
        if(a.layer != b.layer) {
            return false;
        }

        return true;
    }

    /** Debug Draw */
    public superDraw(ctx : CanvasRenderingContext2D) {

        if (!this.debug) {
            return;
        }
        
        ctx.save();

        //Position
        ctx.translate(
            1 * GMULTX, 
            2 * GMULTY
        );

        //Scale
        let scale = 10;

        //Draw background
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#000";
        ctx.fillRect(
            0,
            0,
            BOUNDARY.maxx * scale,
            BOUNDARY.maxy * scale * 2);

        //Draw z-boxes
        ctx.globalAlpha = 0.75;
        this.zPoints.filter(z => z.state).forEach(p => {

            let border = p.size.y > 2 ? 3 : 1;

            ctx.fillStyle = 
                p.flat       ? "#38F" : 
                p.size.y > 2 ? "#F33" : "#FF3";
            ctx.fillRect(
                scale * p.pos.x + border,
                scale * p.pos.y + border,
                scale * p.size.x - border * 2,
                scale * p.size.y - border * 2);
        });
        
        ctx.restore();
    }

    /** Kahn's algorithm! */
    private topologicalSort(zPoints : ZPoint[], zEdges : ZPoint[][]) : ZPoint[] {

        const sorted : ZPoint[] = [];   //Final sorted
        const starts : ZPoint[] = [];   //Starting & curret set of points

        //Creat map of points an their quantity of back edges
        const leads = new Map(zPoints.map(z => [z, zEdges.filter(e => e[1] === z).length]));
        leads.forEach((q, p) => {
            if(q === 0) {
                starts.push(p);
            }
        });

        //While there are points with zero back edges
        while(starts.length > 0) {

            //Add current point
            let curr = starts.shift()!;
            sorted.push(curr);

            //Subtract all back edges from the points in front
            zEdges.filter(e => e[0] === curr).forEach(e => {
                leads.set(e[1], leads.get(e[1])! - 1)

                //If point has no more back edges, add it.
                if(leads.get(e[1]) == 0) {
                    starts.push(e[1]);
                }
            });
        }

        if(sorted.length != zPoints.length) {

            console.log(`WARNING, LOOP in Z-SORTING, Sorted : ${sorted.length}, Expected : ${zPoints.length}}`);
        }
      
        return sorted;
    }
}

