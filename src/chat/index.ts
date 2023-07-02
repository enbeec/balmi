import { type AlpineComponent } from "alpinejs";
import { type Subscription } from "rxjs";
import { useAutocompleter } from "./autocompleter";

interface Message {
    type: 'chat' | 'meta';
    text: string;
}

type Command = `/${string}`;
function isCommand(s: string): s is Command {
    return s.startsWith('/') && s.includes('=');
}
function getCommand(s: Command) {
    return s.slice(1).split('=').slice(0, 2);
}

function execCommand(s: string) {
    if (isCommand(s)) {
        const [command, value] = getCommand(s);
        window.dispatchEvent(new CustomEvent('set', { detail: { [command]: value } }));
        return true;
    }
    return false;
}

export const Chat = (): AlpineComponent => {
    const wordList: string[] = [
        'balmi',
        'kai',
        'val',

        'balmi says hello',
        'balmi is happy',
        'balmi is quiet',
        'balmi can not read',
        'balmi is not sad'
    ];

    const subscriptions: Subscription[] = [];

    const initialMessage = { type: 'meta', text: `> Started ${new Date().toISOString()}` };

    const {
        subscribe: subscribeAutocomplete,
        setCompletionPrefix,
        cycleCompletionSelection,
        trie$,
    } = useAutocompleter(wordList);

    return {
        rows: [initialMessage] as Message[],
        chatInputEl() {
            return this.$refs.chatInputEl as HTMLInputElement;
        },
        chatInput: '',
        submitChat() {
            const input = this.chatInput;
            if (!input) return;
            if (!execCommand(input))
                this.rows.unshift({type: 'chat', text: this.chatInput});
            this.chatInput = '';
        },

        completions: [] as string[],
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

        rootTrie$: trie$,
        init() {
            subscriptions.push(subscribeAutocomplete(
                ([[completions, completionIndex]]) => {
                    this.completions = completions;
                    this.completionIndex = completionIndex;
                }));
        },
        destroy() {
            while (subscriptions.length) {
                subscriptions.pop()!.unsubscribe();
            }
        },
    };
}