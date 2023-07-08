import { AlpineComponent } from "alpinejs";
import { BehaviorSubject, ObservedValueOf, Subject, combineLatest, debounceTime, distinctUntilChanged, map, tap } from "rxjs";
import { BreakpointSelector } from "../layout/tailwind.helpers";
import { hexColorRegexp } from "../util";
import { Bownzi } from "../canvas/bownzi";

// FOR TESTING
import bss from '../canvas/bownzi/bownzi.png'

type Color = `#${string}`;

interface Avatar {
    Color: Color;
}

export const AvatarEditor = ({ height, width }: { 
    height: number, 
    width: number, 
}): AlpineComponent => {
    const _dimensions$ = new Subject<[number, number]>();
    const dimensions$ = _dimensions$.pipe(
        distinctUntilChanged(
            (a, b) => a[0] === b[0] && a[1] === b[1]
        ),
    );

    const props$ = new BehaviorSubject<{
        avatar: Avatar;
    }>({
        avatar: {
            Color: '#7cf484',
        },
    });

    type Props = ObservedValueOf<typeof props$>;

    return {
        resize(h: number, w: number, bp: BreakpointSelector) {
            _dimensions$.next([h, w]);
        },
        recolor(color: string) {
            if (!hexColorRegexp().test(color)) {
                throw new Error(`${color} is not a valid hex color!`);
            }

            // TODO
        },
        setup() {
        },
        draw() {
        },
        init() {
            this.setup();
            this.draw(props$.value);
            this.subscribe();
            _dimensions$.next([height, width]);

            // TEST DRAW
            const ctx = (
                this.$el.querySelector('#avatar-editor-canvas') as HTMLCanvasElement
            ).getContext('2d')!;
            const b = Bownzi.newSprite();
            // const render = b.blitter();
            // render(ctx, [0, 0]);

            // ctx.drawImage(b.source, 10, 10);

            ctx.drawImage((() => {
                const i = new Image();
                i.src = bss;
                return i;
            })(), 0, 0);
            // END TEST DRAW
        },
        subscribe() {
            this.subscription = combineLatest([
                dimensions$,
                props$,
            ])
            .pipe(
                debounceTime(50),
                map(([_, svgProps]) => svgProps),
                // tap(props => console.('draw avatar editor', { props }))
            )
            .subscribe(this.draw);
        },
        unsubscribe() {
            this.subscription.unsubscribe();
        }
    }
}