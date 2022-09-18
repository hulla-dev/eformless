import { useState } from 'react'
import { checkErrors } from './helpers/errorChecking'
import { undefinedOnEmpty } from './helpers/typeguards'
import { extractValue } from './helpers/conversion'
import type {
  CheckFunction,
  ErrorOnOptions,
  ErrorType,
  FieldHandlerFunction,
  FieldResultType
} from './@types'

const useField = <T>({
  value: passedValue,
  name,
  errorOn = 'error',
  checkFunctions = [] as CheckFunction<T>[],
}: {
  value: T
  name: string,
  errorOn?: ErrorOnOptions | ErrorOnOptions[],
  checkFunctions?: CheckFunction<T>[]
}, ...extraCheckFunctions: CheckFunction<T>[]
): [FieldResultType<T>, FieldHandlerFunction<T>, FieldHandlerFunction<T>] => {
  const functionsToRun = [...checkFunctions, ...extraCheckFunctions]
  const [value, setValue] = useState(passedValue)
  // eslint-disable-next-line max-len
  const [errors, setErrors] = useState<ErrorType<T>[]>(checkErrors(value, name, functionsToRun, errorOn))
  const [changed, setChanged] = useState<boolean>(false)
  const [blurred, setBlurred] = useState<boolean>(false)
  /* -------------------- 2. Handler functions definitions -------------------- */
  const handleChange: FieldHandlerFunction<T> = (event) => {
    const newVal = extractValue(event)
    setValue(newVal)
    setErrors(checkErrors(newVal, name, functionsToRun, errorOn))
    setChanged(true)
  }

  const handleBlur: FieldHandlerFunction<T> = (event) => {
    const newVal = extractValue(event)
    setValue(newVal)
    setErrors(checkErrors(newVal, name, functionsToRun, errorOn))
    setBlurred(true)
  }

  const field: FieldResultType<T> = {
    value,
    name,
    error: !!errors.length,
    errors: undefinedOnEmpty(errors),
    errorMessage: (errors[0])?.message || '',
    changed,
    blurred,
  }

  return [field, handleChange, handleBlur]
}

export default useField
