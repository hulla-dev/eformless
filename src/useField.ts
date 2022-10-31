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
} from './types'

const useField = <T>(
  data: FieldInitialization<T>,
  ...checkFunctions: CheckFunction<FieldValue<T>>[]
) => {
  const { name, errorOn = ['error'], value: passedValue } = initializeField(data)
  const functionsToRun: CheckFunction<FieldValue<T>>[] = [
    ...checkFunctions,
    ...(data.checkFunctions || []),
  ]
  const [value, setValue] = useState(passedValue)
  const [errors, setErrors] = useState<ErrorType<FieldValue<T>>[]>(
    checkErrors(value, name, functionsToRun, errorOn),
  )
  const [changed, setChanged] = useState<boolean>(false)
  const [blurred, setBlurred] = useState<boolean>(false)
  /* -------------------- 2. Handler functions definitions -------------------- */
  const onChange: FieldHandlerFunction<FieldValue<T>> = (event) => {
    const newVal = extractValue(event, value)
    if (newVal !== value) {
      setValue(newVal)
      setErrors(checkErrors(newVal, name, functionsToRun, errorOn))
    }
    setChanged(true)
  }

  const onBlur: FieldHandlerFunction<FieldValue<T>> = (event) => {
    const newVal = extractValue(event, value)
    if (newVal !== value) {
      setValue(newVal)
      setErrors(checkErrors(newVal, name, functionsToRun, errorOn))
    }
    setBlurred(true)
  }

  const field: FieldType<FieldValue<T>> = {
    value,
    name,
    error: !!errors.length,
    errors: undefinedOnEmpty(errors),
    errorMessage: errors[0]?.message || '',
    changed,
    blurred,
    onChange,
    onBlur,
  }

  return field
}

export default useField
