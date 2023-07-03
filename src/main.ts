import Alpine, { type AlpineComponent } from 'alpinejs';
import './style.css'
import { Chat } from "./chat";
import { Layout, Sizer } from './layout';
import { init as initFeather } from './util/feather';
import { D3Tree } from './util/d3';
import { EVENT_KEY, EventBus } from './events';
import { Subject } from 'rxjs';

declare global {
    interface Window {
        Alpine: typeof Alpine;
    }
}
window.Alpine = Alpine;

initFeather(Alpine);

Alpine.data('chat', Chat);

Alpine.data('layout', Layout as () => AlpineComponent);
Alpine.data('sizer', Sizer);

Alpine.data('d3tree', D3Tree as () => AlpineComponent);

Alpine.data('eventBus', EventBus as () => AlpineComponent);
Alpine.store('eventKey', EVENT_KEY);

Alpine.store('eventBus$', new Subject());
Alpine.store('rootTrie$', '');

Alpine.start();