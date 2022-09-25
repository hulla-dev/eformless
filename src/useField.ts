import { useState } from 'react'
import { checkErrors } from './helpers/errorChecking'
import { initializeField, undefinedOnEmpty } from './helpers/typeguards'
import { extractValue } from './helpers/conversion'
import type {
  CheckFunction,
  ErrorType,
  FieldHandlerFunction,
  FieldInitialization,
  FieldType,
  FieldValue,
} from './@types'

const useField = <T>(
  dataOrName: FieldInitialization<FieldValue<T>> | string,
  ...checkFunctions: CheckFunction<FieldValue<T>>[]
): FieldType<FieldValue<T>> => {
  const data = initializeField(dataOrName)
  const { name, errorOn = 'error' } = data
  const functionsToRun = [...checkFunctions, ...(data.checkFunctions || [])]
  const [value, setValue] = useState<FieldValue<T>>(data.value === undefined
    ? '' as FieldValue<T>
    : data.value as FieldValue<T>
  )
  // eslint-disable-next-line max-len
  const [errors, setErrors] = useState<ErrorType<FieldValue<T>>[]>(checkErrors(value, name, functionsToRun, errorOn))
  const [changed, setChanged] = useState<boolean>(false)
  const [blurred, setBlurred] = useState<boolean>(false)
  /* -------------------- 2. Handler functions definitions -------------------- */
  const handleChange: FieldHandlerFunction<FieldValue<T>> = (event) => {
    const newVal = extractValue(event)
    setValue(newVal)
    setErrors(checkErrors(newVal, name, functionsToRun, errorOn))
    setChanged(true)
  }

  const handleBlur: FieldHandlerFunction<FieldValue<T>> = (event) => {
    const newVal = extractValue(event)
    setValue(newVal)
    setErrors(checkErrors(newVal, name, functionsToRun, errorOn))
    setBlurred(true)
  }

  const field: FieldType<FieldValue<T>> = {
    value,
    name,
    error: !!errors.length,
    errors: undefinedOnEmpty(errors),
    errorMessage: (errors[0])?.message || '',
    changed,
    blurred,
    onChange: handleChange,
    onBlur: handleBlur,
  }

  return field
}

export default useField
