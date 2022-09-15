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
}): [FieldResultType<T>, FieldHandlerFunction<T>, FieldHandlerFunction<T>] => {
  const [value, setValue] = useState(passedValue)
  // eslint-disable-next-line max-len
  const [errors, setErrors] = useState<ErrorType<T>[]>(checkErrors(value, name, checkFunctions, errorOn))
  const [changed, setChanged] = useState<boolean>(false)
  const [blurred, setBlurred] = useState<boolean>(false)
  /* -------------------- 2. Handler functions definitions -------------------- */
  const handleChange: FieldHandlerFunction<T> = (event) => {
    const newVal = extractValue(event)
    setValue(newVal)
    setErrors(checkErrors(newVal, name, checkFunctions, errorOn))
    setChanged(true)
  }

  const handleBlur: FieldHandlerFunction<T> = (event) => {
    const newVal = extractValue(event)
    setValue(newVal)
    setErrors(checkErrors(newVal, name, checkFunctions, errorOn))
    setBlurred(true)
  }

  const field: FieldResultType<T> = {
    value,
    name,
    errors: undefinedOnEmpty(errors),
    error: errors?.length ? errors[0].message : undefined,
    changed,
    blurred,
  }

  return [field, handleChange, handleBlur]
}

export default useField
