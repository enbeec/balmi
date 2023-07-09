
import { Sprite } from "../sprite";
import { Coords, Dimensions } from "../blitter";
import bownziBg from './bownzi_bg.png';
import bownziFg from './bownzi_fg.png';
import { LayerLoader } from "../layers";

// see piskel source file for frame length and export dimensions
const BOWNZI_FRAMES = 14;
const BOWNZI_DIMENSIONS: Dimensions = [16, 16];
const BOWNZI_SCALE = 2;
const BOWNZI_LAYERS = [
    'bownzi_bg', 
    'bownzi_fg'
];
const BOWNZI_SOURCES = [
    bownziBg, 
    bownziFg
];
const BOWNZI_ORIGIN: Coords = [0,0];

enum L { bg, fg }

/** 
 * A cute blobby guy drawn from two layers. Recolorable. 
 * Note: bownzi lands on frame ~7 and jumps on frame ~11
*/
export class Bownzi extends Sprite {
    static get loaded() { return; }

    static layerLoader = new LayerLoader({
        names: BOWNZI_LAYERS,
        sources: BOWNZI_SOURCES,
        frames: BOWNZI_FRAMES,
        dimensions: BOWNZI_DIMENSIONS,
        scale: BOWNZI_SCALE,
    });

    /** Must be called once to preload sprite sheets */
    static async init() {
        await this.layerLoader.load();
    }

    /** static "constructor" so we don't have to override Sprite.constructor */
    static newSprite(): Bownzi {
        // new canvas (so this sprite can be recolored independently)
        const source = new OffscreenCanvas(...this.layerLoader.sheetDimensions);
        const ctx = source.getContext('2d')!;

        // read layers onto source canvas
        this.layerLoader.readLayers(ctx, BOWNZI_ORIGIN);

        // create sprite
        return new Bownzi(source, {
            dimensions: this.layerLoader.spriteDimensions,
            length: BOWNZI_FRAMES,
            origin: BOWNZI_ORIGIN,
        });
    }

    recolor(color: string) {
        Bownzi.layerLoader.recolor(L.bg, color);
        Bownzi.layerLoader.readLayers(this.source.getContext('2d')!, BOWNZI_ORIGIN);
    }
}