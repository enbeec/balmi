import { type AlpineComponent } from "alpinejs";
import { Subject, Subscription, filter, tap } from "rxjs";


type AppEvent =
    | `app:shutdown`;

export type EventName = 
    | AppEvent
    | (string & {});

export type Event<T> = T & {
    name: EventName;
}

export const EVENT_KEY = 'balmi';

interface IEventBus {
    eventBus$: Subject<Event<unknown>>;
    dispatch<T>(event: Event<T>): void;
    subscription: Subscription;
}

const hasErr = <E extends Error>(e: Event<unknown>): e is Event<{ err: E }> =>
    typeof e === 'object' && e.hasOwnProperty('err');

export const EventBus = (eventBus$: Subject<Event<unknown>>): AlpineComponent => {
    return {
        eventBus$,
        subscription: null as unknown as Subscription,
        observe(...names: EventName[]) {
            return this.eventBus$.pipe(filter(({name}) => names.some(n => n === name)));
        },
        dispatch<T>(event: Event<T>) {
            this.$dispatch(EVENT_KEY, event);
        },
        init() {
            this.subscription = this.eventBus$
                .pipe(tap(e => {
                    if (hasErr(e)) {
                        const { err } = e;
                        console.error(err.message);
                    }
                }))
                .subscribe(console.info);
        },
        destroy() {
            this.dispatch({ name: 'app:shutdown', data: undefined });
            this.subscription.unsubscribe();
        },
    } satisfies AlpineComponent<IEventBus>;
}