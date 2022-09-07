import { FieldType, FormType } from './@types'
import { notUndefined } from './helpers/typeguards'
import { flatten } from './helpers/arrays'

const useForm = (name: string, ...fields: FieldType<unknown>[]): FormType => {
  const groupedFields = fields.reduce(
    (fieldsObject, field) => Object.assign(fieldsObject, { [field.name]: { ...field } }),
    {},
  )
  return {
    name,
    fields: groupedFields,
    changed: fields.some(({ changed }) => changed),
    blurred: fields.some(({ blurred }) => blurred),
    allChanged: fields.every(({ changed }) => changed),
    allBlurred: fields.every(({ blurred }) => blurred),
    errors: flatten(fields.map(({ errors }) => errors).filter(notUndefined)),
  }
}

export default useForm
