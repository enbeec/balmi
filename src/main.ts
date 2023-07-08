import Alpine, { type AlpineComponent } from 'alpinejs';
// @ts-ignore
import persist from '@alpinejs/persist';
import './style.css'
import { Chat } from "./chat";
import { Layout, Sizer } from './layout';
import { init as initFeather } from './util/feather';
import { D3Tree } from './components/d3TrieDiagram';
import { EVENT_KEY, EventBus } from './events';
import { Subject } from 'rxjs';
import { AvatarEditor } from './components/AvatarEditor';

declare global {
    interface Window {
        Alpine: typeof Alpine;
    }
}
window.Alpine = Alpine;
Alpine.plugin(persist);

initFeather(Alpine);

Alpine.data('chat', Chat);

Alpine.data('layout', Layout as () => AlpineComponent);
Alpine.data('sizer', Sizer);

Alpine.data('d3tree', D3Tree as () => AlpineComponent);

Alpine.data('eventBus', EventBus as () => AlpineComponent);
Alpine.store('eventKey', EVENT_KEY);

Alpine.store('eventBus$', new Subject());
Alpine.store('rootTrie$', '');

Alpine.data('avatarEditor', AvatarEditor as () => AlpineComponent);

Alpine.start();