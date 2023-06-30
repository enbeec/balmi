import Alpine from 'alpinejs';
import './style.css'
import { Chat } from "./chat";
import { Layout } from './layout';
import { init as initFeather } from './util/feather';
import { init as initState } from './state';

declare global {
    interface Window {
        Alpine: typeof Alpine;
    }
}
window.Alpine = Alpine;

initFeather(Alpine);
initState(Alpine);

Alpine.data('chat', Chat);
Alpine.data('layout', Layout);

Alpine.start();