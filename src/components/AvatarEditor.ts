import { AlpineComponent } from "alpinejs";
import { BreakpointSelector } from "../layout/tailwind.helpers";
import { hexColorRegexp } from "../util";
import { Bownzi } from "../canvas/bownzi";
import { Coord, Coords } from "../canvas/blitter";

export const AvatarEditor = (): AlpineComponent => {
    return {
        resize(h: number, w: number, bp: BreakpointSelector) {
            // TODO
            h; w; bp;
        },
        recolor(color: string) {
            if (!hexColorRegexp().test(color))
                throw new Error(`${color} is not a valid hex color!`);

            this.sprite.recolor(color);
        },

        async init() {
            // preloads the offscreen canvas with sprite data
            await this.setup();

            const canvas = this.$el.querySelector('#avatar-editor-canvas') as HTMLCanvasElement;
            const { height, width } = canvas;

            const ctx = canvas.getContext('2d')!;
            ctx.imageSmoothingEnabled = false;

            // Bownzi extends a base sprite class and has a static "constructor" called newSprite
            this.sprite = Bownzi.newSprite();

            // creates the drawing function that takes a context and coordinate pair
            const render = this.sprite.blitter();

            let coords: Coords = [0, 0]; // Start at the top left corner of the canvas

            const updateCoords = (coords: Coords): Coords => {
                let newX = Math.floor(coords[Coord.x] + Math.random() * 6 - 3);
                let newY = Math.floor(coords[Coord.y] + Math.random() * 6 - 3);
            
                // Check if the new coordinates are within the bounds of the canvas
                if (newX < 0) newX = 0;
                if (newY < 0) newY = 0;
                if (newX > width) newX = width;
                if (newY > height) newY = height;
            
                return [newX, newY];
            };

            let frameIndex = 0;
            let delay_ms = 40; let lastTime = 0;

            const animate = (time = 0) => {
                if (lastTime === 0) lastTime = time;

                if (time - lastTime >= delay_ms) {
                    // render
                    frameIndex = render(ctx, coords);
                    
                    // update time
                    lastTime = time;

                    // add a small random value to delay_ms to make the animation feel more organic
                    delay_ms = 40 + Math.random() * 15; // Vary delay_ms within a range of 40 to 70 ms

                    // on the frame where it bounces, move
                    if (frameIndex === 11) coords = updateCoords(coords);
                }

                requestAnimationFrame(animate);
            }

            // render first frame
            render(ctx, coords);

            // start loop (second frame will render after delay_ms)
            animate();
        },
        sprite: null as unknown as Bownzi,
        getContext() { return null as unknown as CanvasRenderingContext2D },
        async setup() {
            await Bownzi.init();
            this.sprite = Bownzi.newSprite();
        },
    } satisfies AlpineComponent<{
        sprite: Bownzi;
        getContext(): CanvasRenderingContext2D
    }>
}