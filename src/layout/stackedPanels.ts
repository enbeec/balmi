import { Z_INDICIES } from "./tailwind.helpers";

export type PanelSelector = 'ctrl' | 'flex';
export type PanelContext = {
    chatPanelPosition: string;
    ctrlPanelPosition: string;
    flexPanelPosition: string;
}

export const useStackedPanels = () => {
    let panelPosition: readonly PanelSelector[] = ['ctrl', 'flex'];
    const focusPanel = (panel: PanelSelector) => {
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
    };
    const updatePanelPosition = <CTX extends PanelContext>(ctx: CTX) => {
        // set each panel position according to its index
        panelPosition.forEach(
            (pp, idx) => {
                const key = pp + 'PanelPosition' as keyof PanelContext;
                ctx[key] = Z_INDICIES[idx]
            }
        );
    }

    return {
        focusPanel,
        updatePanelPosition,
        panelPosition,
    }
}