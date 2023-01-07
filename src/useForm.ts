import { useState } from 'react'
import { FieldMap, Form, MappedErrors } from './types'
import { flatten } from './helpers/arrays'
import { values } from './helpers/objects'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useForm = <M extends Record<string, unknown>, S extends (...args: any[]) => any>(
  fields: FieldMap<M>,
  submit?: S,
): Form<M, S> => {
  const [submitted, isSubmitted] = useState(false)
  const onSubmit = (...args: Parameters<S>) => {
    isSubmitted(true)
    if (submit) {
      return submit(...args)
    }
    return
  }
  return {
    fields,
    errors: flatten(
      values(fields).map(({ errors }) => errors || []),
    ) as MappedErrors<M>[keyof MappedErrors<M>][],
    isChanged: values(fields).some(({ isChanged }) => isChanged),
    isBlurred: values(fields).some(({ isBlurred }) => isBlurred),
    isError: values(fields).some(({ isError }) => isError),
    isAllChanged: values(fields).every(({ isChanged }) => isChanged),
    isAllBlurred: values(fields).every(({ isBlurred }) => isBlurred),
    isAllError: values(fields).every(({ isError }) => isError),
    isAllValid: values(fields).every(({ isError }) => !isError),
    submit: onSubmit,
    isSubmitted: submitted,
  }
}

export default useForm
