import { Sprite } from "./sprite";
import bownziSheet from '../../public/sprites/bownzi.png';
import bownziBg from '../../public/sprites/bownzi_bg.png';
import bownziFg from '../../public/sprites/bownzi_fg.png';

export class Bownzi extends Sprite {
    /** static "constructor" so we don't have to override Sprite.constructor */
    static fromSource(): Bownzi {
        // see piskel source file
        const h = 16, w = 16, length = 14;
        const SHEET_H = h, SHEET_W = w * length;

        const sheet = new OffscreenCanvas(SHEET_W, SHEET_H);
        const image = new Image(SHEET_W, SHEET_H);
        image.src = bownziSheet;

        sheet.getContext('2d')?.drawImage(image, 0, 0);
        // TODO: load png into sheet

        return new Bownzi(sheet, {
            dimensions: [h, w],
            origin: [0, 0],
            length,
        });
    }

    recolor(color: string) {
        // TODO: recolor the bg of the sprite
        // - [ ] create new canvas
        // - [ ] read in bg image
        // - [ ] recolor canvas: https://stackoverflow.com/questions/45706829/change-color-image-in-canvas
        // - [ ] read from new canvas to source canvas
        // - [ ] read in fg on top of the source canvas
        color; bownziBg; bownziFg;
    }
}