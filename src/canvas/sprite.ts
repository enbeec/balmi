import { Blittable, Frames, makeBlitter } from "./blitter";

export class Sprite implements Blittable {
    private source: OffscreenCanvas; 
    private frames: Frames;
    constructor(source: OffscreenCanvas, frames: Frames) {
        this.source = source;
        this.frames = frames;
    }

    blitter() {
        return makeBlitter(this.source, this.frames);
    }
}

