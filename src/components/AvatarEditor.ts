import { AlpineComponent } from "alpinejs";
import { BreakpointSelector } from "../layout/tailwind.helpers";
import { hexColorRegexp } from "../util";
import { Bownzi } from "../canvas/bownzi";

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
            await this.setup();

            // TEST DRAW
            const ctx = (
                this.$el.querySelector('#avatar-editor-canvas') as HTMLCanvasElement
            ).getContext('2d')!;
            const b = Bownzi.newSprite();
            const renderer = b.blitter();
            this.render = () => renderer(ctx, [12, 12]);
            this.render();
            // END TEST DRAW
        },
        render() {},
        sprite: null as unknown as Bownzi,
        canvas: null as unknown as CanvasRenderingContext2D,
        async setup() {
            await Bownzi.init();
        },
    } satisfies AlpineComponent<{
        sprite: Bownzi;
        canvas: CanvasRenderingContext2D;
        render(): void;
    }>
}