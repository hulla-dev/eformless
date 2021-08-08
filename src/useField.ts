import { ChangeEvent, useState } from 'react'
import { CheckFunction, ErrorType, FieldHandlerFunction, FieldType } from './@types'
import { checkErrors } from './helpers/errorChecking'
import { undefinedOnEmpty } from './helpers/typeguards'
import { convertBackToType } from './helpers/convertBackToType'

const useField = <T>({
  value: passedValue,
  name: passedName,
  checkFunctions = [] as CheckFunction<T>[],
}: {
  value: T
  name: string
  checkFunctions?: CheckFunction<T>[]
}): [FieldType<T>, FieldHandlerFunction, FieldHandlerFunction] => {
  const [value, setValue] = useState(passedValue)
  const [name, setName] = useState(passedName)
  const [errors, setErrors] = useState<ErrorType<T>[]>(checkErrors(value, name, checkFunctions))
  const [wasBlurred, setWasBlurred] = useState<boolean>(false)
  const [wasChanged, setWasChanged] = useState<boolean>(false)
  /* -------------------- 2. Handler functions definitions -------------------- */
  const handleChange: FieldHandlerFunction = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value: eventValue, checked, type } = event.target
    const coercedBack = convertBackToType(eventValue, checked, type)
    setValue(coercedBack as T)
    setName(name)
    setErrors(checkErrors(value, name, checkFunctions))
    setWasChanged(true)
  }

  const handleBlur: FieldHandlerFunction = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value: eventValue, checked, type } = event.target
    const coercedBack = convertBackToType(eventValue, checked, type)
    setValue(coercedBack as T)
    setName(name)
    setErrors(checkErrors(value, name, checkFunctions))
    setWasBlurred(true)
  }

  const field: FieldType<T> = {
    value,
    name,
    errors: undefinedOnEmpty(errors),
    wasBlurred,
    wasChanged,
  }

  return [field, handleChange, handleBlur]
}

export default useField
