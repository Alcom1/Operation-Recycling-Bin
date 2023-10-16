import GameObject from "engine/gameobjects/gameobject";
import { BOUNDARY, col1D, gap1D, GMULTX, GMULTY } from "engine/utilities/math";
import Vect, { Point } from "engine/utilities/vect";

interface ZPoint {
    gameObject : GameObject,
    pos : Point,
    size : Point,
    flat : Boolean,
    state : Boolean,
    glide : Boolean,
    layer : Number,
    noCompare : Boolean
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
                    pos : this.getTrueZpos(o.zpos, o.zSize.y == 0),
                    size : this.getTrueZsize(o.zSize),
                    flat : o.zSize.y == 0,
                    state : o.zState,
                    glide : o.zGlide,
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

        this.zEdges = [];
        
        //Setup zpoints for current state
        this.zPoints.forEach(z => {
            z.pos = this.getTrueZpos(z.gameObject.zpos, z.flat);
            z.state = z.gameObject.zState;
            z.layer = z.gameObject.zLayer;
        });
        
        //Compare z-points and get the edges between them
        this.zEdges = this.zPointsActive.flatMap(z => this.processZPoint(z).map(b => [z, b]));

        //Set z-indicies based on sorted array indicies
        this.topologicalSort().forEach((z, i) => {
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

    /** Process a single zPoint */
    private processZPoint(c : ZPoint) : ZPoint[] {

        let ret = [] as ZPoint[];

        //Game Objects above
        ret = ret.concat(this.zPointsActive.filter(o => {

            //If the comparison is invalid, skip
            if(!this.checkValidComparison(c, o)) {
                return false;
            }

            let isAbove = c.pos.y > o.pos.y;

            let isAlign = col1D(
                c.pos.x,
                c.pos.x + c.size.x,
                o.pos.x,
                o.pos.x + o.size.x + (c.flat && o.glide ? 1 : 0));  //Gliders roll over studs

            let distance = gap1D(
                o.pos.y,
                o.pos.y + o.size.y,
                c.pos.y,
                c.pos.y + c.size.y);

            return (
                isAbove &&                  //Other object is above 
                isAlign &&                  //Other object is horizontally aligned 
                distance <= 1);             //Other object is close
        }));

        //Game Objects in front
        ret = ret.concat(this.zPointsActive.filter(o => {

            //If the comparison is invalid, skip
            if(!this.checkValidComparison(c, o)) {
                return false;
            }

            let isAhead = c.pos.x < o.pos.x;

            let isAlign = col1D(
                c.pos.y,
                c.pos.y + c.size.y,
                o.pos.y,
                o.pos.y + o.size.y);

            let distance = gap1D(
                c.pos.x,
                c.pos.x + c.size.x,
                o.pos.x,
                o.pos.x + o.size.x);

            return (
                isAhead &&                  //Other object is ahead
                isAlign &&                  //Other object is vertically aligned
                distance <= 1 &&            //Other object is close
                !(c.glide && o.flat) &&     //Gliders roll over studs
                !(o.flat && distance < 0)); //Overlapping with flat objects does not mean they're in front.
        }));

        return ret;
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
        this.zPointsActive.forEach(p => {

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

