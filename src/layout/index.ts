import { type AlpineComponent } from "alpinejs";
import { type Simplify } from 'type-fest';
import { Z_INDICIES } from "./tailwind.helpers";
import { type PanelContext, type PanelSelector, useStackedPanels } from "./stackedPanels";
import { type LayoutContext, useLayoutObserver } from "./layoutObserver";

export const Layout = (): AlpineComponent => {
    const { focusPanel, updatePanelPosition } = useStackedPanels();
    const { subLayout } = useLayoutObserver();

    return {
        canvas: [
            'min-h-[680px]',
            'lg:min-h-[1280px]',
        ].join(' '),
        foreground: [
            'min-h-[600px]',
            'm-2',
            'lg:min-h-[1200px]',
        ].join(' '),
        // always on top
        chatPanelPosition: Z_INDICIES[Z_INDICIES.length - 1],
        chatPanel: [
            'h-[300px]', 'max-h-[400px]',
            // 'md:h-[600px]', 'md:w-full',
        ].join(' '),
        flexPanelPosition: '',
        flexPanel: [
            'h-[240px]', 'w-full',
        ].join(' '),
        ctrlPanelPosition: '',
        ctrlPanel: [
            'h-[80px]', 'w-full',
        ].join(' '),
        focusPanel(panel: PanelSelector) {
            focusPanel(panel);
            updatePanelPosition(this);
        },
        bodyWidth: -1,
        bodyHeight: -1,
        isSm: false,
        isMd: false,
        isLg: false,
        isXl: false,
        currentBreakpoint: 'sm',
        init() {
            // write initial panel positions
            updatePanelPosition(this);
            // set up observer and store cleanup function
            this.destroy = subLayout(this);
        },
        destroy() {},
    } satisfies Simplify<LayoutContext & PanelContext & AlpineComponent>;
}