import { 
    Subject, 
    map, 
    debounceTime, 
    distinctUntilChanged, 
    withLatestFrom, 
    observeOn,
    animationFrameScheduler
} from "rxjs";
import { getBreakpoint } from "./breakpoints";
import { BreakpointSelector } from "./tailwind.helpers";
import { AlpineComponent } from "alpinejs";

export class LayoutObserverError extends Error {
    constructor(message?: string) {
        super(message ? 'Error w/ layout observer: ' + message : 'Error with layout observer');
    }
}

export const OBSERVER_DEBOUNCE_MS = 50;

export interface RectContext {
    rectWidth: number;
    rectHeight: number;
}

export interface LayoutContext {
    bodyWidth: number;
    bodyHeight: number;
    currentBreakpoint: BreakpointSelector;
    isSm: boolean;
    isMd: boolean;
    isLg: boolean;
    isXl: boolean;
}

export const useLayoutObserver = () => {
    const _bodyRect$: Subject<DOMRect> = new Subject();
    const bodyRect$ = _bodyRect$.asObservable().pipe(
        observeOn(animationFrameScheduler),
        debounceTime(OBSERVER_DEBOUNCE_MS),
        distinctUntilChanged(),
    );

    const resizeObserver = new ResizeObserver(([{contentRect}]) => {
        _bodyRect$.next(contentRect);
    });

    const subLayout = <CTX extends LayoutContext & AlpineComponent>(ctx: CTX) => {
        resizeObserver.observe(document.body);
        const sub = bodyRect$.pipe(
            withLatestFrom(bodyRect$.pipe(
                map(r => r.width),
                getBreakpoint,
            )),
        ).subscribe(
            ([rect, currentBreakpoint]) => {
                ctx.bodyWidth = rect.width;
                ctx.bodyHeight = rect.height;

                ctx.currentBreakpoint = currentBreakpoint;
                switch (currentBreakpoint) {
                    case 'sm':
                        ctx.isXl = false;
                        ctx.isLg = false;
                        ctx.isMd = false;
                        ctx.isSm = true;
                        break;
                    case 'md':
                        ctx.isXl = false;
                        ctx.isLg = false;
                        ctx.isMd = true;
                        ctx.isSm = false;
                        break;
                    case 'lg':
                        ctx.isXl = false;
                        ctx.isLg = true;
                        ctx.isMd = false;
                        ctx.isSm = false;
                        break;
                    case 'xl':
                        ctx.isXl = true;
                        ctx.isLg = false;
                        ctx.isMd = false;
                        ctx.isSm = false;
                        break;
                    default:
                        throw new LayoutObserverError(
                            'switching current => ' + currentBreakpoint
                        );
                }
            }
        )
        return () => sub.unsubscribe();
    }

    return {
        subLayout,
    }
}

export const useResizeObserver = () => {
    const _rect$ = new Subject<DOMRect>();
    const rect$ = _rect$.asObservable().pipe(
        observeOn(animationFrameScheduler),
        debounceTime(OBSERVER_DEBOUNCE_MS),
        distinctUntilChanged(),
    );

    const resizeObserver = new ResizeObserver(([{contentRect}]) => {
        _rect$.next(contentRect)
    });

    return {
        subSize<CTX extends RectContext>(ctx: CTX, el: HTMLElement) {
            resizeObserver.observe(el);
            const sub = rect$.subscribe(({height, width}) => {
                ctx.rectHeight = height;
                ctx.rectWidth = width;
            });
            return () => sub.unsubscribe();
        }
    }
}