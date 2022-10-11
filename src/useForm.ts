import { useState } from 'react'
import { FieldType, FormFields, FormType } from './types'
import { notUndefined } from './helpers/typeguards'
import { flatten } from './helpers/arrays'
import { assign, omit, values } from './helpers/objects'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useForm = <T extends FieldType<any>[]>(...addedFields: T): FormType<T> => {
  const groupedFields = addedFields.reduce(
    (fieldsObject, field) => ({
      ...fieldsObject,
      [field.name]: field,
    }),
    {} as FormFields<T>,
  )
  const [fields, setFields] = useState<FormFields<T>>(groupedFields as FormFields<T>)
  return {
    fields,
    add: <V>(field: FieldType<V>) => setFields((prev) => assign(prev, { [field.name]: field })),
    remove: (fieldName: keyof typeof fields) =>
      setFields((prev) => omit(fieldName, prev) as FormFields<T>),
    changed: values(fields).some((field) => (field as FieldType<unknown>).changed),
    blurred: values(fields).some(
      (field) => (field as FieldType<FormFields<T>[keyof FormFields<T>]>).blurred,
    ),
    allChanged: values(fields).every(
      (field) => (field as FieldType<FormFields<T>[keyof FormFields<T>]>).changed,
    ),
    allBlurred: values(fields).every(
      (field) => (field as FieldType<FormFields<T>[keyof FormFields<T>]>).blurred,
    ),
    error: flatten(
      values(fields).map(
        (field) => (field as FieldType<FormFields<T>[keyof FormFields<T>]>).errors || [],
      ),
    ).some(notUndefined),
    errors: flatten(
      values(fields)
        .map((field) => (field as FieldType<FormFields<T>[keyof FormFields<T>]>).errors)
        .filter(notUndefined),
    ),
  }
}

export default useForm
