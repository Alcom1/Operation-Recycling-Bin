/** Module bakes images for optimized drawing */
export default class BakerModule {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private images: Record<string, string>;

    /** 
     * @param element HTML canvas element
    */
    constructor(element: HTMLCanvasElement) {

        // Canvas
        this.canvas = document.createElement("canvas");

        // Copy width and height of main canvas
        this.canvas.width = element.width;
        this.canvas.height = element.height;

        // Canvas Content
        const ctx = this.canvas.getContext('2d');
        if (!ctx) throw new Error("Unable to acquire canvas rendering context");
        this.ctx = ctx;
        
        // Cache of previously drawn images
        this.images = {};
    }

    /** 
     * Bake an image and return its data using the canvas
     * @returns Generated image data, or cached image data if in cache
    */
    bake(
        render: (ctx: CanvasRenderingContext2D) => void,
        width?: number,
        height?: number,
        tag?: string
    ) {
        // If an image with this tag has already been baked, return it.
        if (tag && this.images[tag]) {
            return this.images[tag];
        }

        // Stored canvas size to return to.
        const canvasSize = { 
            width : this.canvas.width, 
            height : this.canvas.height
        };

        // Temporary canvas size for baking.
        this.canvas.width = width || this.canvas.width;
        this.canvas.height = height || this.canvas.height;

        this.ctx.save();
        // Clear canvas for drawing
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Generate image
        render(this.ctx);
        // Get image data
        const data = this.canvas.toDataURL();
        
        // Only store image if tag exists
        if (tag) {
            // Store image under this tag
            this.images[tag] = data;
        }
        this.ctx.restore();

        // Reset canvas size.
        this.canvas.width = canvasSize.width;
        this.canvas.height = canvasSize.height;

        return data;
    }
}
