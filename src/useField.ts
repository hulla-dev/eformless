import { useState } from 'react'
import { checkErrors } from './helpers/errorChecking'
import { undefinedOnEmpty } from './helpers/typeguards'
import { extractValue } from './helpers/conversion'
import type { CheckFunction, Config, EventHandler, Field, FieldError, Value } from './types'
import { getConfig } from './config'

export const useField = <T, E = Error, C extends CheckFunction<T> = CheckFunction<T>>(
  name: string,
  initialValue: T,
  configOrCheckFunction?: C | Partial<Config>,
  ...checkFunctions: C[]
) => {
  /* --------------------- 1. State and config definitions -------------------- */
  const defaultConfig = getConfig()
  const config =
    typeof configOrCheckFunction === 'object'
      ? { ...defaultConfig, ...configOrCheckFunction }
      : defaultConfig
  const checks =
    typeof configOrCheckFunction === 'function'
      ? [configOrCheckFunction, ...checkFunctions]
      : checkFunctions
  const [value, setValue] = useState<T>(initialValue)
  const [initialErrors, initialCheckResults] = checkErrors<T, C, E>(value, name, checks, config)
  const [errors, setErrors] = useState<FieldError<T, E>[]>(initialErrors)
  const [checkResults, setCheckResults] = useState(initialCheckResults)
  const [isChanged, setIsChanged] = useState<boolean>(false)
  const [isBlurred, setIsBlurred] = useState<boolean>(false)

  /* -------------------- 2. Handler functions definitions -------------------- */
  const handle =
    (type: 'change' | 'blur'): EventHandler<T> =>
    (event) => {
      const newVal = extractValue(event, value, config)
      if (!config.comparator(newVal, value)) {
        // Check for web elements that mutate the input value
        if (config.warnOnTypeMismatch) {
          if (typeof newVal !== typeof value) {
            console.warn(
              // eslint-disable-next-line max-len
              `[eformless]: Value of field "${name}" was changed from ${typeof value} to ${typeof newVal}. This likely happens because you have disabled "coerceBack" parameter in your config for web elements or you are using a custom input component that mimics the HTMLInputElement structure, but that does not pass the value prop to the underlying input element. If you wish to disable this warning, set "warnOnTypeMismatch" to false in your config.`,
            )
          }
        }
        // Update value and check for errors
        setValue(newVal as T)
        const [newErrors, newCheckResults] = checkErrors<T, C, E>(
          newVal as T,
          name,
          checkFunctions,
          config,
        )
        setErrors(newErrors)
        setCheckResults(newCheckResults)
      }
      // Log the change / blur event
      if (type === 'change') {
        setIsChanged(true)
      } else {
        setIsBlurred(true)
      }
    }

  const onChange = handle('change')
  const onBlur = handle('blur')

  /* -------------------------------- 3. Result ------------------------------- */
  const field: Field<T, E, C> = {
    value: value as Value<T, C>,
    name,
    checkResults: checkResults,
    errors: undefinedOnEmpty(errors),
    error: undefinedOnEmpty([errors[0]]) === undefined ? undefined : errors[0],
    isError: errors.length > 0,
    isChanged,
    isBlurred,
    onChange,
    onBlur,
  }

  return field
}

export default useField
