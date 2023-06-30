import { type Alpine } from 'alpinejs';
// @ts-ignore
import { replace, icons } from 'feather-icons';

export const iconKeyMap = new Map(Object.keys(icons).map(key => [key, true]));

export function init(A: Alpine) {
    A.store('feathericons', { names: Object.keys(icons) });

    A.directive('feather', (el, { expression }, { evaluate }) => {
        const icon = evaluate(expression) as string;
        if (!iconKeyMap.has(icon)) console.warn(`${expression} is not a feather icon`);
        if (!el.ELEMENT_NODE) throw new Error('directive used on non-element???');
        (el as HTMLImageElement).setAttribute('data-feather', icon);
    });

    document.addEventListener('alpine:initialized', replace);
}