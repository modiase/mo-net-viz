import { pipe } from 'fp-ts/function';
import * as RA from 'fp-ts/ReadonlyArray';
import { pairs } from './itertools';
import * as RNA from 'fp-ts/ReadonlyNonEmptyArray';

export const minMax = (values: RNA.ReadonlyNonEmptyArray<number>) => {
  return pipe(
    pairs(values),
    RA.map(([a, b]) => [Math.min(a, b), Math.max(a, b)] as const),
    RA.reduce(
      [values[0], values[0]] as const,
      ([a, b]: readonly [number, number], [min, max]: readonly [number, number]) => {
        const _min = Math.min(min, a, b);
        const _max = Math.max(max, a, b);
        return [Math.min(min, _min), Math.max(max, _max)] as const;
      }
    )
  );
};
