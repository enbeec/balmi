import { AlpineMagics } from "alpinejs";
import { LayoutContext } from "./layoutObserver";
import { EVENT_KEY, Event } from "../events";
import { Observable, Subscription, tap } from "rxjs";
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

    const chatPanel = document.querySelector('#chat-panel') as HTMLElement;
    const ctrlPanel = document.querySelector('#ctrl-panel') as HTMLElement;
    const flexPanel = document.querySelector('#flex-panel') as HTMLElement;
    console.log({flexPanel, ctrlPanel, chatPanel})

    function scatter() {
        flexPanel.style.transform = `translateX(${flexPanel.offsetWidth - 12}px)`;
        chatPanel.style.transform = `translateY(-${chatPanel.offsetHeight - 12}px)`;
    }

    function gather() {
        flexPanel.style.transform = '';
        chatPanel.style.transform = '';
    }

    let breakpointSubscription: Subscription | null = null;

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
        scatter();
        ctx.$dispatch(EVENT_KEY, {
            name: 'fullscreen:begin',
            el: { ...ctx.$refs.canvas },
        });
        // TODO: subscribe to breakpoint
    };

    /** throws or unsets current */
    function onEnd(id: string) {
        if (!current || id !== current)
            throw new Error(`${id} fullscreen:end recieved but current fullscreen is ${current}`);
        current = '';
        gather();
        // TODO: unsubscribe to breakpoint
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