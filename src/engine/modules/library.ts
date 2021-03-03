import { pathImg } from "../utilities/math";

/** Module that stores assets for simutaneous non-redudnant asset loading */
export default class LibraryModule {
    private assetsImage: Map<string, HTMLImageElement> = new Map<string, HTMLImageElement>();
    private loadingCount: number = 0;

    /** Get an image asset, store it if it's new. */
    public getImage(name : string, extension? : string) {

        const curr = this.assetsImage.get(name);

        //If the asset isn't in the library, add it
        if(curr == null) {
            this.loadingCount++;

            //Create, store, and return new image
            const image = new Image();
            image.src = pathImg(name, extension);
            image.onload = e => this.loadingCount--;
            this.assetsImage.set(name, image);
            return image;
        }
        
        return curr;
    }

    /** Return true if all assets are loaded */
    public getLoaded() {

        //Return if there's no more images that need loading
        return this.loadingCount <= 0;
    }
}
