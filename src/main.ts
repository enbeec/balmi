import Alpine from 'alpinejs';
import './style.css'
import { Chat } from "./chat";
import { Layout } from './layout';
import { init as initFeather } from './util/feather';

initFeather(Alpine);

declare global {
    interface Window {
        Alpine: typeof Alpine;
    }
}
window.Alpine = Alpine;

Alpine.data('chat', Chat);
Alpine.data('layout', Layout);

Alpine.start();