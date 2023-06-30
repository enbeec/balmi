import { type Alpine } from "alpinejs"
import { Subject } from "rxjs";
import { type Trie } from "./util/trie";

const newStateStore = () => ({
    init() {
        this.rootTrie$.subscribe(console.info);
    },
    /** Used to subscribe to the chat autocomplete trie. */
    rootTrie$: new Subject<Trie>(),
});

export const init = (A: Alpine) => {
    A.store('state', newStateStore());
}

export type StateStore = ReturnType<typeof newStateStore>;