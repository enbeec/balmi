import Alpine from 'alpinejs';
import './style.css'
import { Balmi } from "./balmi";
import { Layout } from './layout';

declare global {
    interface Window {
        Alpine: typeof Alpine;
    }
}
window.Alpine = Alpine;

Alpine.data('balmi', Balmi);
Alpine.data('layout', Layout);

Alpine.start();