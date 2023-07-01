import { AlpineComponent } from "alpinejs";

/** Should match Alpine's internal type of the same name */
export type XDataContext<T = Record<string,any>> = T & {
    init?(): void;
};

/** TODO: file a bug with https://github.com/DefinitelyTyped/DefinitelyTyped
 * because $store's type is *wrong* and this is my workaround */
export function $store<T, K extends string>(component: AlpineComponent) {
    return component.$store as { [k in K]: T }
}