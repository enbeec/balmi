import Alpine from 'alpinejs';
import {
    BehaviorSubject,
    Subject,
    Subscription,
    combineLatestWith,
    distinctUntilChanged,
    map, withLatestFrom, scan, startWith, pairwise, combineLatest,
} from "rxjs";
import { Trie } from "./trie.ts";
import './style.css'
import {useAutocompleter} from "./autocompleter.ts";

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
        'balmi says hello',
        'ding'
    ];
    
    const subscriptions: Subscription[] = [];

    const initialMessage = { type: 'meta', text: `> Started ${new Date().toISOString()}` };

    const {
        subscribe: subscribeAutocomplete,
        setCompletionPrefix,
        completionCycle,
    } = useAutocompleter(wordList);

    return {
        rows: [initialMessage] as Message[],
        chatInputEl() {
            return this.$refs.chatInputEl as HTMLInputElement;
        },
        chatInput: '',
        onChat() {
            if (!this.chatInput) return;
            this.rows.unshift({type: 'chat', text: this.chatInput});
            this.chatInput = '';
        },

        completions: [],
        completionIndex: 0,
        onComplete(idx?: number) {
            if (typeof idx === 'number') {
                this.chatInput = this.completions[idx];
                this.clearComplete();
                this.chatInputEl().focus();
                return;
            }

            // make sure the subject is synced to state
            setCompletionPrefix(this.chatInput);
            // emit an increment event
            completionCycle();
        },
        clearComplete() {
            setCompletionPrefix('');
        },

        init() {
            subscriptions.push(subscribeAutocomplete(
                ([completions, completionIndex]) => {
                    this.completions = completions;
                    this.completionIndex = completionIndex;
            }));
        },
        destroy() {
            while (subscriptions.length) {
                subscriptions.pop()!.unsubscribe();
            }
        },
    }
});

Alpine.start();