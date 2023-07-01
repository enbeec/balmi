import { Observable, distinctUntilChanged, tap } from "rxjs";

export const tapDistinct = <T>(source: Observable<T>, sideEffect: (v: T) => void): Observable<T> => {
    return source.pipe(
        distinctUntilChanged(),
        tap(sideEffect),
    )
}