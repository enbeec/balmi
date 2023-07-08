/** Utilities for rendering to a canvas from an offscreen spritesheet. */

/** [height, width] */
export type Dimensions = [number, number];

/** [x, y] */
export type Coords = [number, number];

export interface Frames {
    dimensions: Dimensions;
    origin: Coords;
    length: number;
}

// TODO: support more than left-to-right sprite sheets
// TODO: support a scale parameter
export function makeBlitter(
    source: OffscreenCanvas,
    {
        dimensions: [height, width],
        origin: [x0, y0],
        length,
    }: Frames
) {
    let i = 0, sourceX = x0, sourceY = y0;

    const advance = () => {
        if (i + 1 >= length) {
            // if last frame, go to beginning
            i = 0;
            sourceX = x0;
            // sourceY = y0;
        } else {
            // otherwise increment and update
            i++;
            sourceX += width;
        }
    }

    return (dest: CanvasRenderingContext2D, [destX, destY]: Coords) => {
        dest.drawImage(
            source,
            sourceX, sourceY, width, height,
            destX, destY, width, height,
        );
        advance();
    };
}

export type Blitter = ReturnType<typeof makeBlitter>;

export interface Blittable {
    blitter(): Blitter;
}