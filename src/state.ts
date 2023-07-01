import { type Alpine } from "alpinejs"
import { Subject, Subscription, combineLatest } from "rxjs";
import { type Trie } from "./util/trie";
import { BreakpointSelector } from "./layout/tailwind.helpers";
import { tapDistinct } from "./util/rxjs";

const newStateStore = () => ({
    subscriptions: [] as Subscription[],
    init() {
        this.subscriptions.push(combineLatest([
            tapDistinct(
                this.rootTrie$, trie => this.rootTrie = trie
            ),
            tapDistinct(
                this.currentBreakpoint$, breakpoint => this.currentBreakpoint = breakpoint
            ),
        ]).subscribe());
    },
    destroy() {
        while (this.subscriptions.length) {
            this.subscriptions.pop()!.unsubscribe();
        }
    },
    /** Used to subscribe to the chat autocomplete trie. */
    rootTrie$: new Subject<Trie>(),
    rootTrie: null as unknown as Trie,
    currentBreakpoint$: new Subject<BreakpointSelector>(),
    currentBreakpoint: 'sm' as BreakpointSelector,
});

export const init = (A: Alpine) => {
    A.store('state', newStateStore());
}

export type StateStore = ReturnType<typeof newStateStore>;