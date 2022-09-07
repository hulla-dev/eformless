import { useState } from 'react'
import { CheckFunction, ErrorType, FieldHandlerFunction, FieldResultType } from './@types'
import { checkErrors } from './helpers/errorChecking'
import { undefinedOnEmpty } from './helpers/typeguards'
import { extractValue } from './helpers/conversion'

const useField = <T>({
  value: passedValue,
  name,
  checkFunctions = [] as CheckFunction<T>[],
}: {
  value: T
  name: string
  withTypeConversion?: boolean
  checkFunctions?: CheckFunction<T>[]
}): [FieldResultType<T>, FieldHandlerFunction<T>, FieldHandlerFunction<T>] => {
  const [value, setValue] = useState(passedValue)
  const [errors, setErrors] = useState<ErrorType<T>[]>(checkErrors(value, name, checkFunctions))
  const [changed, setChanged] = useState<boolean>(false)
  const [blurred, setBlurred] = useState<boolean>(false)
  /* -------------------- 2. Handler functions definitions -------------------- */
  const handleChange: FieldHandlerFunction<T> = (event) => {
    const newVal = extractValue(event)
    setValue(newVal)
    setErrors(checkErrors(newVal, name, checkFunctions))
    setChanged(true)
  }

  const handleBlur: FieldHandlerFunction<T> = (event) => {
    const newVal = extractValue(event)
    setValue(newVal)
    setErrors(checkErrors(newVal, name, checkFunctions))
    setBlurred(true)
  }

  const field: FieldResultType<T> = {
    value,
    name,
    errors: undefinedOnEmpty(errors),
    changed,
    blurred,
  }

  return [field, handleChange, handleBlur]
}

export default useField
