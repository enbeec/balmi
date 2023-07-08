import { Blittable, Frames, makeBlitter } from "./blitter";

export class Sprite implements Blittable {
    source: OffscreenCanvas; 
    frames: Frames;
    constructor(source: OffscreenCanvas, frames: Frames) {
        this.source = source;
        this.frames = frames;
    }

    blitter() {
        return makeBlitter(this.source, this.frames);
    }
}

