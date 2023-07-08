import { Split } from "type-fest";

export const split = <S extends string, D extends string>(s: S, d: D) => 
    s.split(d) as Split<S, D>;

export const hexColorRegexp = () => /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i;