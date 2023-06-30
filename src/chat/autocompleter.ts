import {
    BehaviorSubject, combineLatest,
    combineLatestWith,
    distinctUntilChanged,
    map,
    pairwise, scan,
    startWith,
    Subject,
    withLatestFrom
} from "rxjs";
import { Trie } from "../util/trie.js";

export function useAutocompleter(wordList: string[]) {
    const trie$ = new BehaviorSubject(new Trie(wordList));
    const completionPrefix$ = new BehaviorSubject<string>('');
    const incrementCompIdx$ = new Subject<void>();

    // performs autocomplete by combining latest distinct prefix with latest completion trie
    const completions$ = completionPrefix$.pipe(
        distinctUntilChanged(),
        combineLatestWith(trie$),
        map(([prefix, completions]): string[] => {
            if (prefix === '') return [] as string[];
            return completions.autocomplete(prefix);
        }),
    );

    // tracks the current completion index
    const completionIndex$ = incrementCompIdx$.pipe(
        withLatestFrom(
            completionPrefix$.pipe(
                startWith(null),
                pairwise(),
                map(([prev,next]) => prev !== next)
            ),
            completions$.pipe(map(arr => arr.length))
        ),
        scan((compIdx, [, prefixChanged, compLength]) => {
            if (prefixChanged) return 0;
            if (++compIdx >= compLength) return 0;
            return compIdx;
        }, 0),
    );

    type CompletionsObserver = (args: [string[], number]) => void;

    return {
        subscribe: (observer: CompletionsObserver) => {
            return combineLatest([
                completions$,
                completionIndex$
            ]).subscribe(observer);
        },
        setCompletionPrefix: (prefix: string) => completionPrefix$.next(prefix),
        cycleCompletionSelection: () => incrementCompIdx$.next(),
        trie$: trie$.asObservable(),
    }
}
