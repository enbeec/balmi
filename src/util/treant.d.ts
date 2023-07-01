import { Opaque } from "type-fest";

export interface TreantNodeStructure {
    text: { name: string },
    children: TreantNodeStructure[];
}

/** see docs for full options */
export interface TreantConfig {
    chart: {
        container: `#${string}` | (string & {});
    };
    nodeStructure: TreantNodeStructure;
}

export type Treant = Opaque<unknown>;

declare export function newTreant(config: TreantConfig): Treant;