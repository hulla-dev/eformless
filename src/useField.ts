import { useState } from 'react'
import { checkErrors } from './helpers/errorChecking'
import { undefinedOnEmpty } from './helpers/typeguards'
import { extractValue } from './helpers/conversion'
import type { CheckFunction, Config, EventHandler, Field, FieldError, Props } from './types'
import { getConfig } from './config'
import { merge } from './helpers/objects'
import { guessedProps } from './helpers/guessProps'

export const useField = <
  T,
  E = Error,
  C extends CheckFunction<T> = CheckFunction<T>,
  X extends Partial<Config<'field'>> = Partial<Config<'field'>>,
>(
  name: string,
  initialValue: T,
  configOrCheckFunction?: C | X,
  ...checkFunctions: C[]
) => {
  /* --------------------- 1. State and config definitions -------------------- */
  const defaultConfig = getConfig()
  const config: Config<'field'> =
    typeof configOrCheckFunction === 'object'
      ? {
          ...defaultConfig,
          ...configOrCheckFunction,
          ready: configOrCheckFunction.ready ?? initialValue !== undefined,
        }
      : { ...defaultConfig, ready: true }
  const checks =
    typeof configOrCheckFunction === 'function'
      ? [configOrCheckFunction, ...checkFunctions]
      : checkFunctions
  const [value, setValue] = useState<T>(initialValue)
  // Note: not a useState, not to get confused due to similar syntax
  const [initialErrors, initialCheckResults] = checkErrors<T, C, E>(value, name, checks, config)
  const [errors, setErrors] = useState<FieldError<T, E>[]>(initialErrors)
  const [checkResults, setCheckResults] = useState(initialCheckResults)
  const [isDifferent, setIsDifferent] = useState<boolean>(false)
  const [isChanged, setIsChanged] = useState<boolean>(false)
  const [isBlurred, setIsBlurred] = useState<boolean>(false)

  /* -------------------- 2. Handler functions definitions -------------------- */
  const handle =
    (type: 'change' | 'blur'): EventHandler<T> =>
    (event) => {
      const newVal = extractValue(event, value, config)

      // Check for web elements that mutate the input value
      if (config.warnOnTypeMismatch) {
        if (typeof newVal !== typeof value) {
          console.warn(
            // eslint-disable-next-line max-len
            `[eformless]: Value of field "${name}" was changed from ${typeof value} to ${typeof newVal}. This likely happens because you specified a field with two possible types or you have used a native web element and disabled "coerceBack" parameter. If this behaviour is intentional and wish to disable this warning, set "warnOnTypeMismatch" to false in your config (for either this field or entire eformless)`,
          )
        }
      }
      // Update value and check for errors
      const [newErrors, newChecked] = checkErrors<T, C, E>(newVal as T, name, checks, config)
      // We only want to update the value if the new value is allowed
      // If no config for allowing is specified we allow all values
      if (config.allow !== undefined) {
        if (config.allow(newVal)) {
          setValue(newVal as T)
        }
      } else {
        setValue(newVal as T)
      }
      if (initialValue !== newVal) {
        setIsDifferent(true)
      } else {
        setIsDifferent(false)
      }
      setErrors(newErrors)
      setCheckResults(newChecked)

      // Log the change / blur event
      if (type === 'change') {
        setIsChanged(true)
      } else {
        setIsBlurred(true)
      }
    }

  const onChange = handle('change')
  const onBlur = handle('blur')

  const props = merge(
    { name, onChange, onBlur },
    guessedProps(name, value, config),
  ) as unknown as Props<T, E, C, X>

  /* -------------------------------- 3. Result ------------------------------- */
  const field: Field<T, E, C, X> = {
    value,
    name,
    checkResults: checkResults,
    errors: undefinedOnEmpty(errors),
    error: errors[0],
    isError: errors.length > 0,
    isChanged,
    isBlurred,
    isDifferent,
    onChange,
    onBlur,
    props,
  }

  return field
}

export default useField
