/**
 * Flattens nested array - an `Array.prototype.flat()` polyfill
 * @param arr Array to flatten
 * @returns Array flattened by one level
 */
export const flatten = <T>(arr: T[][]): T[] => arr.reduce((acc, val) => acc.concat(val), [])

/**
 * Checks whether item is identical to comparator, or matches item in comparator array
 * @param value - Item to check
 * @param against - Comparator to check against
 * @returns Boolean depending on the check
 * @example isOrIncludes('foo', 'foo') // true
 * isOrIncludes('foo', ['foo', 'bar']) // true
 * isOrIncludes('foo', 'bar') // false
 * isOrIncludes('foo', ['bar', 'baz']) // false
 */
export const isOrIncludes = <T, V extends T | T[]>(value: T, against: V) => {
  if (Array.isArray(against)) {
    return against.includes(value)
  }
  return value === (against as unknown as T)
}