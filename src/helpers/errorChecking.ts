import { CheckFunction, ErrorType } from '../@types'
import { notNull } from './typeguards'

export const invokeCheckFunction = <T>(
  value: T,
  name: string,
  checkFunction: CheckFunction<T>,
): ErrorType<T> | null => {
  try {
    // we attempt invoking check function, if it passes (is OK), returns null
    // ideally checkFunction should throw a customized error
    const check = checkFunction(value)
    // but in case checks are written with falsy values we generate an error message
    if (!check) {
      throw Error(`${checkFunction.name} check failed with value: ${check}`)
    }
    return null
  } catch (error) {
    return {
      name,
      value,
      function: checkFunction.name,
      error: error,
      message: error.message,
    }
  }
}

export const checkErrors = <T>(
  value: T,
  name: string,
  checkFunctions: CheckFunction<T>[],
): ErrorType<T>[] => {
  const errors = checkFunctions.map((callback) => invokeCheckFunction(value, name, callback))
  return errors.filter(notNull)
}
