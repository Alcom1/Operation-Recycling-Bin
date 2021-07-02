import { pathImg } from "../utilities/math";

/** Module that stores assets for simutaneous non-redudnant asset loading */
export default class LibraryModule {
    private assetsImage: Map<string, HTMLImageElement> = new Map<string, HTMLImageElement>();
    private loadingCount: number = 0;

    /** Get an image asset, store it if it's new. */
    public getImage(name : string, extension? : string) {

        const curr = this.assetsImage.get(name);

        return curr == null ? 
            this.storeImage(name, pathImg(name, extension)) :   //If the asset isn't in the library, add it
            curr;                                               //Otherwise, return existing asset
    }

    /** Get an image asset from a full src, store it if it's new. */
    public getImageWithSrc(name : string, src : string) {

        const curr = this.assetsImage.get(name);

        return curr == null ? 
            this.storeImage(name, src) :                        //If the asset isn't in the library, add it
            curr;                                               //Otherwise, return existing asset
    }

    private storeImage(name : string, src : string) {

        this.loadingCount++;
        
        //Create, store, and return new image
        const image = new Image();
        image.src = src;
        image.onload = e => this.loadingCount--;
        this.assetsImage.set(name, image);
        return image;
    }

    /** Return true if all assets are loaded */
    public getLoaded() {

        //Return if there's no more images that need loading
        return this.loadingCount <= 0;
    }
}
