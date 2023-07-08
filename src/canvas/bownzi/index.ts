import { Sprite } from "../sprite";
import bownziSheet from './bownzi.png';
import bownziBg from './bownzi_bg.png';
import bownziFg from './bownzi_fg.png';
import { Dimension, Dimensions } from "../blitter";

// see piskel source file for frame length and export dimensions
const BOWNZI_FRAMES = 14;
const BOWNZI_DIMENSIONS: Dimensions = [16, 16];
const BOWNZI_SHEET_DIMENSIONS: Dimensions = [
    BOWNZI_DIMENSIONS[Dimension.height],
    BOWNZI_DIMENSIONS[Dimension.width * BOWNZI_FRAMES],
];

/** Helper to prepare sprite sheets form just a URL */
const imageFromURL = (url: string) => {
    const image = new Image(...BOWNZI_SHEET_DIMENSIONS);
    image.src = url;
    return image;
}

export class Bownzi extends Sprite {
    /** static "constructor" so we don't have to override Sprite.constructor */
    static newSprite(): Bownzi {
        const sheet = new OffscreenCanvas(...BOWNZI_SHEET_DIMENSIONS);
        const sheetCTX = sheet.getContext('2d')!;
        sheetCTX.drawImage(imageFromURL(bownziSheet), 0, 0);

        return new Bownzi(sheet, {
            dimensions: BOWNZI_DIMENSIONS,
            origin: [0, 0],
            length: BOWNZI_FRAMES,
        });
    }

    recolor(color: string) {
        const temp = new OffscreenCanvas(...BOWNZI_SHEET_DIMENSIONS);
        const tempCTX = temp.getContext('2d')!;
        const sourceCTX = this.source.getContext('2d')!;

        // copy background into temp canvas
        tempCTX.drawImage(imageFromURL(bownziBg), 0, 0);

        // fill background color in temp canvas
        // see: https://stackoverflow.com/questions/45706829/change-color-image-in-canvas
        tempCTX.globalCompositeOperation = 'source-in';
        tempCTX.fillStyle = color;
        tempCTX.fillRect(0, 0, ...BOWNZI_SHEET_DIMENSIONS);

        // draw the foreground on top
        tempCTX.drawImage(imageFromURL(bownziFg), 0, 0);

        // copy from temp canvas to source canvas
        sourceCTX.drawImage(temp, 0, 0);
    }
}