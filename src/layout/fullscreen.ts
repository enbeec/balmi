import { AlpineMagics } from "alpinejs";
import { LayoutContext } from "./layoutObserver";
import { EVENT_KEY, Event } from "../events";
import { Observable, tap } from "rxjs";
import { split } from "../util";

/* Fullscreen Events

         Canvas Component

           +----------+
           |Begin  (2)|
           |el: Canvas|
           |id: string|
           +----+-----+
                |
                |
   canvas       |
   stores       v       canvas
   id       component   clears
    ^       renders     id  
    |       to canvas     ^
    |                     |
    |                     |
    |                     |
+---+--------+     +------+-----+
|Request  (1)|     |End      (3)|
|id: string  |     |id: string  |
+------------+     +------------+

          Component
 */
export type FullscreenEventName = 
    | 'fullscreen:request'
    | 'fullscreen:deny'
    | 'fullscreen:begin'
    | 'fullscreen:end';

export type FullscreenEventData<EN extends FullscreenEventName> = {
    ['fullscreen:request']: { id: string };
    ['fullscreen:deny']: { err: FullscreenDenied };
    ['fullscreen:begin']: { id: string; el: HTMLDivElement };
    ['fullscreen:end']: { id: string };
}[EN] & { name: string };

export class FullscreenDenied extends Error {}

export type FullscreenServerEvent = Event<FullscreenEventData<'fullscreen:request' | 'fullscreen:end'>>;

export const fullscreenServer = (
    ctx: LayoutContext & AlpineMagics<LayoutContext>,
    event$: Observable<Event<FullscreenServerEvent>>,
) => {
    let current = '';

    /** dispatches deny or begin (and stores id) */
    function onRequest(id: string) {
        if (current) {
            ctx.$dispatch(EVENT_KEY, {
                name: 'fullscreen:deny',
                err: new FullscreenDenied(`${current} is already fullscreened - wait your turn`),
            });
            return
        }
        current = id;
        // TODO: move panels according to breakpoint
        ctx.$dispatch(EVENT_KEY, {
            name: 'fullscreen:begin',
            el: { ...ctx.$refs.canvas },
        });
    };

    /** throws or unsets current */
    function onEnd(id: string) {
        if (!current || id !== current)
            throw new Error(`${id} fullscreen:end recieved but current fullscreen is ${current}`);
        current = '';
    };

    return event$.pipe(
        tap((e) => {
            switch (split(e.name as FullscreenEventName, ':')[1]) {
                case 'request': 
                    onRequest((e as FullscreenEventData<'fullscreen:request'>).id);
                    break;
                case 'end': 
                    onEnd((e as FullscreenEventData<'fullscreen:request'>).id);
                    break;
            }
        })
    );
}