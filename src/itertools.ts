import { pipe } from 'fp-ts/function';
import * as RA from 'fp-ts/ReadonlyArray';

type Pair<T> = readonly [T, T];

/**
 * Overlapping pairs of the elements of an array.
 * @param arr - The array to pair.
 * @returns A readonly array of pairs.
 */
export const pairwise = <T>(arr: readonly T[]): readonly Pair<T>[] => {
  return RA.zip(arr, arr.slice(1));
};

/**
 * Pairs the elements of an array.
 * If the array has an odd number of elements, the last element is paired with itself.
 * @param arr - The array to pair.
 * @returns A readonly array of pairs.
 */
export const pairs = <T>(arr: readonly T[]): readonly Pair<T>[] => {
  return pipe(
    RA.chunksOf(2)(arr) as readonly Pair<T>[],
    RA.map((p) => (p.length === 2 ? p : ([p[0], p[0]] as Pair<T>)))
  );
};
