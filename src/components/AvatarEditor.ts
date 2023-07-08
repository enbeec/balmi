import { AlpineComponent } from "alpinejs";
import { BehaviorSubject, ObservedValueOf, Subject, combineLatest, debounceTime, distinctUntilChanged, map, tap } from "rxjs";
import { BreakpointSelector } from "../layout/tailwind.helpers";

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
        setup() {
        },
        draw({ avatar }: Props) {
        },
        init() {
            this.setup();
            this.draw(props$.value);
            this.subscribe();
            _dimensions$.next([height, width]);
        },
        subscribe() {
            this.subscription = combineLatest([
                dimensions$,
                props$,
            ])
            .pipe(
                debounceTime(50),
                map(([_, svgProps]) => svgProps),
                tap(props => console.debug('draw avatar editor', { props }))
            )
            .subscribe(this.draw);
        },
        unsubscribe() {
            this.subscription.unsubscribe();
        }
    }
}