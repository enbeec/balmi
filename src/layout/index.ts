import { type AlpineComponent } from "alpinejs";
import { type Simplify } from 'type-fest';
import { type PanelContext, type PanelSelector, useStackedPanels } from "./stackedPanels";
import { type LayoutContext, useLayoutObserver } from "./layoutObserver";

export const Layout = (): AlpineComponent => {
    const { focusPanel, updatePanelPosition } = useStackedPanels();
    const { subLayout } = useLayoutObserver();


    return {
        canvas: [
            'min-h-[680px]',
        ].join(' '),
        foreground: [
            'min-h-[600px]', 'm-2',
        ].join(' '),

        chatPanelPosition: '',
        chatPanel: [
            'order-3', 'lg:order-1',
            'min-h-[400px]',
            'w-full',
            'lg:-m-4', 'xl:-m-6',
        ].join(' '),

        flexPanelPosition: '',
        flexPanel: [
            'order-2',
            'min-h-[320px]',
            'w-full',
            'lg:m-4 lg:mt-8', 'xl:m-6',
        ].join(' '),

        ctrlPanelPosition: '',
        ctrlPanel: [
            'order-1', 'lg:order-3',
            'lg:self-end',
            'xl:w-[200%]',
            'xl:row-end-4',
            'h-[80px]', 'xl:h-[160px]',
            'w-full',
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
