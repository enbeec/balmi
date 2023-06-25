import { OperatorFunction, map } from "rxjs";
import { 
    getBreakpointsFromConfig, 
    breakpointSelectors,
    BreakpointSelector, 
} from "./tailwind.helpers";

enum Breakpoint { sm, md, lg, xl }

const breakpoints = getBreakpointsFromConfig();
const breakpointMap = new Map(breakpointSelectors.map((key, idx) => [key, breakpoints[idx]]));
const breakpointIndexMap = new Map(breakpointSelectors.map((key) => [key, Breakpoint[key]]));

const widthToBreakpointSelector = (w: number): BreakpointSelector => {
    let res: BreakpointSelector;
    for (let i = 0; i < breakpoints.length; i++) {
        const comparison = w >= breakpoints[i];
        if (i === 0) {
            if (w <= breakpoints[i]) {
                // we know it's sm if it's smaller than sm
                res = 'sm';
                break;
            }
            // if it's bigger than sm it could still be sm
            // w >= sm
            res = 'sm';
        } else if (i === breakpoints.length - 1) {
            // w >= xl
            if (comparison) {
                // we know it's xl if it's larger than xl
                res = 'xl';
                break;
            }
        } else {
            // w >= {md,lg}
            if (comparison) {
                // if we're bigger than a breakpoint in the middle, that might be the one
                res = breakpointSelectors[i];
            }
        }
    }
    console.groupEnd();
    return res!;
}

export const getBreakpoint: OperatorFunction<number, BreakpointSelector> = 
    (width$) => width$.pipe(map(widthToBreakpointSelector));

export const isBreakpoint = 
    (bps: typeof breakpointSelectors[number]): OperatorFunction<number, boolean> =>
        (width$) => {
            const width = breakpointMap.get(bps)!;
            let nextWidth: number;
            if (bps === 'xl') nextWidth = breakpoints[Breakpoint.sm];
            else nextWidth = breakpoints[breakpointIndexMap.get(bps)! + 1];
            return width$.pipe(
                map(w => w >= width && w < nextWidth),
            );
        }