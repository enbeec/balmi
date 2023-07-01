import { type Alpine } from "alpinejs"
import { Subject, Subscription } from "rxjs";
import { type Trie } from "./util/trie";

const newStateStore = () => ({
    subscriptions: [] as Subscription[],
    init() {
        this.rootTrie$.subscribe(trie => this.rootTrie = trie);
    },
    destroy() {
        while (this.subscriptions.length) {
            this.subscriptions.pop()!.unsubscribe();
        }
    },
    /** Used to subscribe to the chat autocomplete trie. */
    rootTrie$: new Subject<Trie>(),
    rootTrie: null as unknown as Trie,
});

export const init = (A: Alpine) => {
    A.store('state', newStateStore());
}

export type StateStore = ReturnType<typeof newStateStore>;