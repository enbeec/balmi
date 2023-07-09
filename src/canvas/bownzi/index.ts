import { Sprite } from "../sprite";
import { Coords, Dimension, Dimensions } from "../blitter";
import bownziBg from './bownzi_bg.png';
import bownziFg from './bownzi_fg.png';

// see piskel source file for frame length and export dimensions
const BOWNZI_FRAMES = 14;
const BOWNZI_DIMENSIONS: Dimensions = [16, 16];
const BOWNZI_SHEET_DIMENSIONS: Dimensions = [
    BOWNZI_DIMENSIONS[Dimension.width] * BOWNZI_FRAMES,
    BOWNZI_DIMENSIONS[Dimension.height],
];

enum Layer {
    bg,
    fg,
    NUM_LAYERS
}

/** calculate each layer's position in the easel */
const layerOffset = (layer: Layer): Coords => [
    0,
    0 + BOWNZI_SHEET_DIMENSIONS[Dimension.height] * layer
];

/** A cute blobby guy drawn from two layers. Recolorable. */
export class Bownzi extends Sprite {
    protected static ready = false;

    /** Must be called once to preload sprite sheets */
    static async init() {
        const easelCTX = this.easelCTX()!;
        if (!easelCTX) throw new Error('failed to create bownzi easel context');
        // get ready for some indentation!
        return Promise.all<HTMLImageElement>([
            bownziBg, 
            bownziFg,
        ].map(
            (url) => new Promise((resolve, reject) => {
                const image = new Image(...BOWNZI_SHEET_DIMENSIONS);
                image.onload = () => resolve(image);
                image.src = url;
                image.onerror = reject;
                image.src = url;
            })
        )).then(
            ([bgImage, fgImage]) => {
                easelCTX.drawImage(bgImage, ...layerOffset(Layer.bg));
                easelCTX.drawImage(fgImage, ...layerOffset(Layer.fg));
                this.ready = true;

                // debug offscreen source
                this.easel.convertToBlob().then(blob => {
                    let url = URL.createObjectURL(blob);
                    let container = document.querySelector('#debug-canvas')!;
                    let img = document.createElement('img');
                    img.src = url;
                    container.appendChild(img);
                })
            }
        );
    }

    /** static "constructor" so we don't have to override Sprite.constructor */
    static newSprite(): Bownzi {
        // new canvas (so this sprite can be recolored independently)
        const source = new OffscreenCanvas(...BOWNZI_SHEET_DIMENSIONS);
        const sourceCTX = source.getContext('2d')!;
        const origin: Coords = [0, 0];

        // draw background
        sourceCTX.drawImage(...this.fromLayer(Layer.bg, BOWNZI_SHEET_DIMENSIONS));

        // draw foreground
        sourceCTX.drawImage(...this.fromLayer(Layer.fg, BOWNZI_SHEET_DIMENSIONS));

        // create sprite
        return new Bownzi(source, {
            dimensions: BOWNZI_DIMENSIONS,
            length: BOWNZI_FRAMES,
            origin,
        });
    }

    recolor(color: string) {
        const temp = new OffscreenCanvas(...BOWNZI_SHEET_DIMENSIONS);
        const tempCTX = temp.getContext('2d')!;
        const sourceCTX = this.source.getContext('2d')!;

        // copy background into temp canvas
        tempCTX.drawImage(...Bownzi.fromLayer(Layer.bg));

        // fill background color in temp canvas
        // see: https://stackoverflow.com/questions/45706829/change-color-image-in-canvas
        tempCTX.globalCompositeOperation = 'source-in';
        tempCTX.fillStyle = color;
        tempCTX.fillRect(0, 0, ...BOWNZI_SHEET_DIMENSIONS);

        // draw the foreground on top
        tempCTX.drawImage(...Bownzi.fromLayer(Layer.fg));

        // copy from temp canvas to source canvas
        sourceCTX.drawImage(temp, 0, 0);
    }

    // ===== sprite storage ======
    private static easel = new OffscreenCanvas(
        BOWNZI_SHEET_DIMENSIONS[Dimension.width],
        BOWNZI_SHEET_DIMENSIONS[Dimension.height] * Layer.NUM_LAYERS,
    );

    private static easelCTX() { return this.easel.getContext('2d') }

    private static fromLayer(layer: Layer, dimensions?: Dimensions): [
        CanvasImageSource, 
        ...Coords, ...Dimensions, 
        ...Coords, ...Dimensions
    ] {
        return [
            this.easel, 
            ...layerOffset(layer), ...(dimensions || BOWNZI_DIMENSIONS),
            0, 0, ...(dimensions || BOWNZI_DIMENSIONS),
        ];
    }
}