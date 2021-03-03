import { pathImg } from "../utilities/math";

/** Module that stores assets for simutaneous non-redudnant asset loading */
export default class LibraryModule {
    private assetsImage: Map<string, HTMLImageElement> = new Map<string, HTMLImageElement>();
    private isLoaded: Boolean = true;

    /** Get an image asset, store it if it's new. */
    public getImage(name : string, extension? : string) {

        const curr = this.assetsImage.get(name);

        //If the asset isn't in the library, add it
        if(curr == null) {
            this.isLoaded = false;

            //Create, store, and return new image
            const image = new Image();
            image.src = pathImg(name, extension);
            this.assetsImage.set(name, image);
            return image;
        }
        
        return curr;
    }

    /** Return true if all assets are loaded */
    public getLoaded() {
        
        //If the library isn't marked as loaded
        if(!this.isLoaded) {

            //Check all assets for loaded status, set loaded as true if everything is loaded
            if(Array.from(this.assetsImage.values()).every(i => i.complete)) {
                this.isLoaded = true;
            }

            return this.isLoaded;
        }

        return true;
    }
}
