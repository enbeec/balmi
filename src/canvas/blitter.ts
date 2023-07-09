/** Utilities for rendering to a canvas from an offscreen spritesheet. */

export enum Dimension { width, height };

/** [width, height] */
export type Dimensions = [number, number];

export enum Coord { x, y };

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

    let lastX: number, lastY: number;

    return (dest: CanvasRenderingContext2D, [destX, destY]: Coords) => {
        if (typeof lastX !== 'number') {
            lastX = destX;
            lastY = destY;
        }

        dest.clearRect(lastX, lastY, width, height);
        dest.drawImage(
            source,
            sourceX, sourceY, width, height,
            destX, destY, width, height,
        );
        lastX = destX; 
        lastY = destY;
        advance();
        return i;
    };
}

export type Blitter = ReturnType<typeof makeBlitter>;

export interface Blittable {
    blitter(): Blitter;
}