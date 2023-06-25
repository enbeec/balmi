import Alpine from 'alpinejs';
import './style.css'
import { Balmi } from "./balmi.ts";

declare global {
    interface Window {
        Alpine: typeof Alpine;
    }
}
window.Alpine = Alpine;

Alpine.data('balmi', Balmi);

Alpine.start();