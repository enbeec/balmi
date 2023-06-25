export const breakpointSelectors = ['sm', 'md', 'lg', 'xl'] as const;
export declare const getBreakpointsFromConfig = (): [number, number, number, number] => [];
export type BreakpointSelector = typeof breakpointSelectors[number];
export declare const Z_INDICIES: [string, string, string, string, string, string];