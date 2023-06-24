import Alpine from 'alpinejs';
import {
    BehaviorSubject,
    Subject,
    Subscription,
    combineLatestWith,
    distinctUntilChanged,
    map, withLatestFrom, scan, startWith, pairwise,
} from "rxjs";
import { Trie } from "./trie.ts";
import './style.css'

declare global {
    interface Window {
        Alpine: typeof Alpine;
    }
}
window.Alpine = Alpine;

interface Message {
    type: 'chat' | 'meta';
    text: string;
}

Alpine.data('balmi', () => {
    const wordList = [
        'foo',
        'foobar',
        'baz'
    ];
    
    const subscriptions: Subscription[] = [];

    const completions$ = new BehaviorSubject(new Trie(wordList));
    const completionPrefix$ = new Subject<string>();
    const localCompletions$ = completionPrefix$.pipe(
        distinctUntilChanged(),
        combineLatestWith(completions$),
        map(([prefix, completions]): string[] => {
            if (prefix === '') return [] as string[];
            return completions.autocomplete(prefix);
        }),
    );
    const incrementCompIdx$ = new Subject<void>();
    const compIdx$ = incrementCompIdx$.pipe(
        withLatestFrom(
            completionPrefix$.pipe(
                startWith(null),
                pairwise(),
                map(([prev,next]) => prev !== next)
            ),
            localCompletions$.pipe(map(arr => arr.length))
        ),
        scan((compIdx, [, prefixChanged, compLength]) => {
            if (prefixChanged) return 0;
            if (++compIdx >= compLength) return 0;
            return compIdx;
        }, 0),
    );

    return {
        rows: [{ type: 'meta', text: `> Started ${new Date().toISOString()}` }] as Message[],
        chatInputEl() {
            return this.$refs.chatInputEl as HTMLInputElement;
        },
        chatInput: '',
        onChat() {
            if (!this.chatInput) return;
            this.rows.unshift({type: 'chat', text: this.chatInput});
            this.chatInput = '';
        },

        compIdx: 0,
        localCompletions: [],
        onComplete(idx?: number) {
            if (typeof idx === 'number') {
                this.chatInput = this.localCompletions[idx];
                this.clearComplete();
                this.chatInputEl().focus();
                return;
            }

            completionPrefix$.next(this.chatInput);
            incrementCompIdx$.next();
        },
        clearComplete() {
            completionPrefix$.next('');
        },

        init() {
            compIdx$.subscribe(compIdx => this.compIdx = compIdx);

            completionPrefix$.next('');
            localCompletions$.subscribe(localCompletions => this.localCompletions = localCompletions);
        },
        destroy() {
            while (subscriptions.length) {
                subscriptions.pop()!.unsubscribe();
            }
        },
    }
});

Alpine.start();