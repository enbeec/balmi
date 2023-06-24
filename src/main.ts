import './style.css'
import Alpine from 'alpinejs';

declare global {
    interface Window {
        Alpine: typeof Alpine;
    }
}
window.Alpine = Alpine;

interface Message {
    type: 'chat' | 'meta';
    text: string;
}

Alpine.data('balmi', () => {
    return {
        rows: [{ type: 'meta', text: `> Started ${new Date().toISOString()}` }] as Message[],
    }
});

Alpine.start();