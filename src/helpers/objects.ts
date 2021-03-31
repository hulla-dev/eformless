/**
 * Omits a specified property from the object
 *
 * In case the property does not exist returns the same object unchangec
 * @param property - Property you want to be omitted from the object
 * @param object - The object you want to omit the property on
 * @returns The passed object without the specified property
 */
export const omit = <K extends keyof T, T>(property: K, object: T): Omit<T, K> => {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const { [property]: ommitedProperty, ...result } = object
  return result
}

/**
 * Merges two objects into one
 * @param target - The original object
 * @param source - The object you want to merge it with
 * @returns an object with the combined properties
 * @warning
 * In case of identical properties, the target gets overwritten by the source
 * @example
 * const foo = { a: 1, b: 2, }
 * const bar = { b: 'x', c: 'y' }
 * merge(foo, bar) // { a: 1, b: 'x', c: 'y' }
 */
export const merge = <T extends Record<string, unknown>, O extends Record<string, unknown>>(
  target: T,
  source: O,
): T & O => ({ ...target, ...source })

/**
 * Takes a object and maps its values with a passed callback
 * @param object Object to map
 * @param mapFunction Function to update each value of the object, 1st argument current value,
 * second argument is the passed object itself
 * @returns Mapped object with udpated values
 */
export const objectMap = <V, T, K extends keyof T>(
  object: T,
  mapFunction: (passedValue: T[K], object: T) => V,
): { [K in keyof T]: V } => {
  const keys = Object.keys(object) as K[]
  return keys.reduce(
    (result, key) => ({ ...result, [key]: mapFunction(object[key], object) }),
    {} as { [K in keyof T]: V },
  )
}
