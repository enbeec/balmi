import { Coords, Dimension, Dimensions } from "./blitter";

/** Loads image layers into an offscreen canvas. Layers should be stacked vertically. */
export class LayerLoader {
    protected canvas!: OffscreenCanvas;
    private context() { return this.canvas.getContext('2d')! }
    private defaultCompositeOperation: GlobalCompositeOperation = 'source-over';

    private sources!: string[];
    private names!: string[];

    rawSheetDimensions!: Dimensions;
    sheetDimensions!: Dimensions;
    spriteDimensions!: Dimensions;
    fullDimensions!: Dimensions;

    constructor(
        { 
            names, sources,
            frames, dimensions, scale,
        }: { 
            /** Number of frames in spritesheet */
            frames: number;
            /** In pixels. */
            dimensions: Dimensions;
            /** List of layer names from back to front. */
            names: string[];
            /** Image URLs for each layer from back to front. */
            sources: string[];
            /** Should result in an integer dimension (Math.round will be used in case). */
            scale?: number;
        },
    ) {
        // ===== set sources
        if (sources.length !== names.length) 
            throw new Error('sources and names must have same length');

        this.sources = sources;
        this.names = names;

        // ===== calculate dimensions
        const scaledSprite = !scale
            ? dimensions
            : dimensions
                .map(d => Math.round(d * scale)) as Dimensions;

        const scaledSheet = scaledSprite
                .map((d, i) => i === Dimension.width ? d * frames : d) as Dimensions;

        const wholeSheet = [
            scaledSheet[Dimension.width], 
            scaledSheet[Dimension.height] * sources.length, 
        ] as Dimensions;

        this.spriteDimensions = scaledSprite;
        this.sheetDimensions = scaledSheet;
        this.fullDimensions = wholeSheet;

        this.rawSheetDimensions = dimensions
            .map((d, i) => i === Dimension.width ? d * frames : d) as Dimensions;

        // ===== set up canvas
        this.canvas = new OffscreenCanvas(...wholeSheet);
    }

    async load() {
        const ctx = this.context();
        ctx.imageSmoothingEnabled = false;
        const rawDimensions = this.rawSheetDimensions;
        return Promise.all<HTMLImageElement>(this.sources.map(
            (url) => new Promise((resolve, reject) => {
                const image = new Image(...rawDimensions);
                image.onload = () => resolve(image);
                image.onerror = reject;
                image.src = url;
            })
        )).then(
            (images) => {
                images.forEach(
                    (image, idx) =>
                        ctx.drawImage(image, 
                            0, 0, ...rawDimensions, 
                            ...this.layerOffset(idx), ...this.sheetDimensions
                        )
                );
                console.debug('loaded layers', this.names);
            }
        );
    }

    private layerOffset(layerIndex: number): Dimensions {
        return [0, (layerIndex * this.sheetDimensions[Dimension.height])];
    }

    /** Reads layers back to front into provided context at provided coordinates*/
    readLayers(ctx: OffscreenCanvasRenderingContext2D, destination: Coords) {
        /** Args for drawImage */
        type DrawImageArgs = [
            CanvasImageSource,
            ...Coords, ...Dimensions,
            ...Coords, ...Dimensions,
        ];

        this.names.map((...[,idx]) => [
            this.canvas,
            ...this.layerOffset(idx), ...this.sheetDimensions,
            ...destination, ...this.sheetDimensions,
        ] as DrawImageArgs).forEach((args) => ctx.drawImage(...args));
    }

    recolor(layerIndex: number, color: string) {
        const ctx = this.context();

        // fill background color in temp canvas
        // see: https://stackoverflow.com/questions/45706829/change-color-image-in-canvas
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = color;
        ctx.fillRect(...this.layerOffset(layerIndex), ...this.sheetDimensions);

        // reset global composite operation to default
        ctx.globalCompositeOperation = this.defaultCompositeOperation;
    }
}