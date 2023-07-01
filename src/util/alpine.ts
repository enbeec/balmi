import { AlpineComponent } from "alpinejs";

/** Should match Alpine's internal type of the same name */
export type XDataContext<T = Record<string,any>> = T & {
    init?(): void;
    destroy?(): void;
};

/** You have to use dot syntax to index this.$store so this can be used to set that up.
 * 
 * @example 
 * const thingy = $store<Thingy,'someKey'>(this).someKey;
 * 
 * TODO: file a bug with DefinitelyTyped because $store's type is *wrong* and this is my workaround */
export function $store<T, K extends string>(component: AlpineComponent) {
    return component.$store as { [k in K]: T }
}