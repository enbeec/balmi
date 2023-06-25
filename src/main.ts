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

type PanelSelector = 'ctrl' | 'flex';

Alpine.data('layout', () => {
    // note the leading spaces so we can concat them
    const Z_INDICIES = [' z-50', ' z-40', ' z-30', ' z-20', ' z-10', ' z-0'];
    let panelPosition = ['ctrl', 'flex'];

    return {
        canvas: [
            'min-h-[680px]',
            'lg:min-h-[1280px]',
        ].join(' '),
        foreground: [
            'min-h-[600px]',
            'm-2', 'pt-4',
            'lg:min-h-[1200px]',
        ].join(' '),
        chatPanelPosition: Z_INDICIES[Z_INDICIES.length - 1],
        chatPanel: [
            // 'm-4', 'mt-0',
            // 'w-[300px]',
            // 'h-[300px]', 'max-h-[400px]',
            // 'md:h-[600px]', 'md:w-full',
        ].join(' '),
        flexPanelPosition: '',
        flexPanel: [
            'relative', 'm-4',
            'h-[240px]', 'w-[300px]',
            'md:h-[380px]', 'md:w-[1000px]', 'md:mx-auto',
        ].join(' '),
        ctrlPanelPosition: '',
        ctrlPanel: [
            'relative', 'm-4',
            'bottom-[-10px] right-[-10px]',
            'h-[80px]', 'w-[300px]',
            'md:absolute',
            'md:h-[140px]', 'md:w-[600px]',
        ].join(' '),
        updatePanelPosition() {
            panelPosition.forEach(
                (pp, idx) =>
                    this[pp+'PanelPosition'] = Z_INDICIES[idx]
            );
        },
        focusPanel(panel: PanelSelector) {
            let _panelPosition = [...panelPosition];
            if (_panelPosition[0] === panel) return;

            // find it
            const panelIdx = _panelPosition.findIndex(
                p => p === panel
            );

            // remove it
            _panelPosition.splice(panelIdx, 1);

            // reinsert it
            _panelPosition.unshift(panel);

            panelPosition = _panelPosition;
            this.updatePanelPosition();
        },
        init() {
            this.updatePanelPosition();
        }
    }
})

Alpine.start();