import { type AlpineComponent } from "alpinejs";
import { type Simplify } from 'type-fest';
import { type PanelContext, type PanelSelector, useStackedPanels } from "./stackedPanels";
import { type LayoutContext, useLayoutObserver, RectContext, useResizeObserver } from "./layoutObserver";
import { type Subscription } from "rxjs";

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
            '-m-1 -mt-24', 'md:-m-2 md:-mt-20', 'lg:-m-4', 'xl:-m-6',
        ].join(' '),

        flexPanelPosition: '',
        flexPanel: [
            'order-2',
            'min-h-[420px]',
            'sm:w-7/8', 'md:w-7/8', 'lg:w-full', 'xl:w-full',
            'sm:m-1', 'md:m-2 mb-4', 'lg:m-4 lg:mt-8', 'xl:m-6',
        ].join(' '),

        ctrlPanelPosition: '',
        ctrlPanel: [
            'order-1', 'lg:order-3',
            'lg:self-end',
            'xl:w-[200%]',
            'xl:row-end-4',
            'h-[80px]', 'xl:h-[160px]',
            'lg:w-[102%]', 'xl:w-[206%]',
            'md:-mx-2', 'lg:-mx-4', 'xl:-mx-6',
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

export const Sizer = (): AlpineComponent => {
    const { subSize } = useResizeObserver();

    return {
        rectHeight: -1,
        rectWidth: -1,
        subscription: null as null | Subscription,
        init() {
            this.destroy = subSize(this, this.$el);
        },
        destroy() {}
    } satisfies Simplify<RectContext & AlpineComponent>;
}