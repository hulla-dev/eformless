import type { CheckFunction, Config, FieldError } from '../types'

type ErrorWithInternal<T, E = Error> = {
  INTENRAL_IS_ERROR: true
} & FieldError<T, E>

export const invokeCheckFunction = <T, C extends CheckFunction<T>, E = Error>(
  value: T,
  name: string,
  checkFunction: C,
  config: Config,
) => {
  let result: ReturnType<C> | ErrorWithInternal<T, E>
  try {
    // If provided a checkAdapter in the config, we apply it to all check functions
    if (config.checkAdapter !== undefined) {
      result = checkFunction(config.checkAdapter(value))
    } else {
      result = checkFunction(value)
    }
    // If errorOn has enabled different types of errors, we throw them
    if (config.errorOn.includes('string') && typeof result === 'string') {
      if (result) {
        throw Error(result)
      }
    }
    if (config.errorOn.includes('boolean') && typeof result === 'boolean') {
      if (!result) {
        throw Error(`${name} is invalid with value: ${value}`)
      }
    }
    // We provide a warning for type mismatch based on config error on values
    if (
      (typeof result !== 'string' && config.errorOn.includes('string')) ||
      (typeof result !== 'boolean' && config.errorOn.includes('boolean'))
    ) {
      console.warn(
        // eslint-disable-next-line max-len
        `[eformless]: The check function for ${name} returned a value of type ${typeof result} instead of ${
          config.errorOn
        }. Please check your check function. (at ${checkFunction.name})`,
      )
    }
  } catch (error) {
    const fieldError: ErrorWithInternal<T, E> = {
      error: error as E,
      message: (error as Error)?.message,
      name,
      value,
      INTENRAL_IS_ERROR: true,
    }
    result = fieldError
  }
  return result
}

const isError = <T, C extends CheckFunction<T>, E = Error>(
  error: ErrorWithInternal<T, E> | ReturnType<C>,
): error is ErrorWithInternal<T, E> => !!(error as ErrorWithInternal<T, E>)?.INTENRAL_IS_ERROR

const removeInternalFlag = <T, C extends CheckFunction<T>, E = Error>(
  checkResults: ErrorWithInternal<T, E> | ReturnType<C>,
): FieldError<T, E> | ReturnType<C> => {
  const { INTENRAL_IS_ERROR, ...rest } = (checkResults ?? {}) as ErrorWithInternal<T, E>
  if (INTENRAL_IS_ERROR) {
    return rest as FieldError<T, E>
  }
  return rest as ReturnType<C>
}

export const checkErrors = <T, C extends CheckFunction<T>, E = Error>(
  value: T,
  name: string,
  checkFunctions: C[],
  config: Config,
): [FieldError<T, E>[], Array<FieldError<T, E> | ReturnType<C>>] => {
  const results = checkFunctions.map((checkfn) =>
    invokeCheckFunction<T, C, E>(value, name, checkfn, config),
  )

  const internalErrors: ErrorWithInternal<T, E>[] = results.filter((e) => isError(e))
  const errors: FieldError<T, E>[] = internalErrors.map(removeInternalFlag)
  const checkResults = results.map(removeInternalFlag)

  return [errors, checkResults]
}
