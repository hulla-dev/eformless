import { useState } from 'react'
import { FieldType, FormFields, FormType } from './types'
import { notUndefined } from './helpers/typeguards'
import { flatten } from './helpers/arrays'
import { assign, remove, values } from './helpers/objects'

type MergedKeys<T, O> = Array<keyof T & keyof O>
type Removed<T, O> = MergedKeys<T, O>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useForm = <T extends FieldType<any>[]>(...fields: T): FormType<T> => {
  const groupedFields = fields.reduce(
    (fieldsObject, field) => ({
      ...fieldsObject,
      [field.name]: field,
    }),
    {} as FormFields<T>,
  )
  const [addedFields, setAddedFields] = useState<FormFields<T>>({} as FormFields<T>)
  const [removedFields, setRemovedFields] = useState<
    Removed<typeof addedFields, typeof groupedFields>
  >([] as Removed<typeof addedFields, typeof groupedFields>)
  return {
    fields: remove(assign(groupedFields, addedFields), ...removedFields) as FormFields<T>,
    add: <V>(field: FieldType<V>) =>
      setAddedFields((prev) => assign(prev, { [field.name]: field })),
    remove: (fieldName: keyof typeof fields | keyof typeof addedFields) =>
      setRemovedFields((prev) => [...prev, fieldName]),
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
