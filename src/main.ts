import Alpine from 'alpinejs';
import './style.css'
import { Balmi } from "./balmi";
import { Layout } from './layout';

// @ts-ignore
import { replace, icons } from 'feather-icons';

const iconKeyMap = new Map(Object.keys(icons).map(key => [key, true]));

document.addEventListener('alpine:initialized', () => replace());

declare global {
    interface Window {
        Alpine: typeof Alpine;
    }
}
window.Alpine = Alpine;

Alpine.data('balmi', Balmi);
Alpine.data('layout', Layout);


Alpine.directive('feather', (el, { expression }, { evaluate }) => {
    const icon = evaluate(expression) as string;
    if (!iconKeyMap.has(icon)) console.warn(`${expression} is not a feather icon`);
    if (!el.ELEMENT_NODE) throw new Error('directive used on non-element???');
    (el as HTMLImageElement).setAttribute('data-feather', icon);
});

Alpine.start();