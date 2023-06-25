import Alpine from 'alpinejs';
import { Subscription } from "rxjs";
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
        'banana',
        'balmi is nice'
    ];
    
    const subscriptions: Subscription[] = [];

    const initialMessage = { type: 'meta', text: `> Started ${new Date().toISOString()}` };

    const {
        subscribe: subscribeAutocomplete,
        setCompletionPrefix,
        cycleCompletionSelection,
    } = useAutocompleter(wordList);

    return {
        rows: [initialMessage] as Message[],
        chatInputEl() {
            return this.$refs.chatInputEl as HTMLInputElement;
        },
        chatInput: '',
        submitChat() {
            if (!this.chatInput) return;
            this.rows.unshift({type: 'chat', text: this.chatInput});
            this.chatInput = '';
        },

        completions: [],
        completionIndex: 0,
        queryCompletions() {
            setCompletionPrefix(this.chatInput);
            cycleCompletionSelection();
        },
        commitCompletion(idx: number) {
            this.chatInput = this.completions[idx];
            this.clearCompletions();
            this.chatInputEl().focus();
        },
        clearCompletions() {
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