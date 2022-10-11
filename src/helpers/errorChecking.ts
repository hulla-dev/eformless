import type { CheckFunction, ErrorOnOptions, ErrorType } from '../types'
import { notNull } from './typeguards'
import { isOrIncludes } from '../helpers/arrays'

export const invokeCheckFunction = <T>(
  value: T,
  name: string,
  checkFunction: CheckFunction<T>,
  errorOn: ErrorOnOptions | ErrorOnOptions[],
): ErrorType<T> | null => {
  try {
    // we attempt invoking check function, if it passes (is OK), returns null
    // ideally checkFunction should throw a customized error
    const check = checkFunction(value)
    // If the user specifies, we can pass a special condition for checking
    if (isOrIncludes('boolean', errorOn)) {
      if (!check) {
        throw Error(`${checkFunction.name} check failed with value: ${check}`)
      }
    }
    if (isOrIncludes('string', errorOn)) {
      if (check) {
        throw Error(check as string)
      }
    }
    return null
  } catch (error) {
    return {
      name,
      value,
      function: checkFunction.name,
      error: error as typeof Error,
      message: (error as Error).message,
    }
  }
}

export const checkErrors = <T>(
  value: T,
  name: string,
  checkFunctions: CheckFunction<T>[],
  errorOn: ErrorOnOptions | ErrorOnOptions[],
): ErrorType<T>[] => {
  const errors = checkFunctions.map((checkfn) => invokeCheckFunction(value, name, checkfn, errorOn))
  return errors.filter(notNull)
}
