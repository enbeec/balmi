import { Subscription } from "rxjs";
import { useAutocompleter } from "./autocompleter";
import { AlpineComponent } from "alpinejs";

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
    const wordList: string[] = [];

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
    };
}