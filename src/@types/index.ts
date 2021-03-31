import { ChangeEvent } from 'react'

/* -------------------------------------------------------------------------- */
/*                              1. Field Handling                             */
/* -------------------------------------------------------------------------- */

export type FieldType<T> = {
  value: T
  name: string
  wasBlurred: boolean
  wasChanged: boolean
  errors?: ErrorType<T>[]
}

export type FieldHanderFunction = (event: ChangeEvent<HTMLInputElement>) => void

/* -------------------------------------------------------------------------- */
/*                                2. Form Types                               */
/* -------------------------------------------------------------------------- */

export type FormType = {
  name: string
  fields: {
    [fieldName: string]: FieldType<unknown>
  }
  wasChanged: boolean
  wasBlurred: boolean
  allChanged: boolean
  allBlurred: boolean
  errors?: ErrorType<unknown>[]
}

/* -------------------------------------------------------------------------- */
/*                              3. Error Handling                             */
/* -------------------------------------------------------------------------- */

export type ErrorType<T> = {
  name: string // name of the input (from event)
  value: T // value of the input (from event)
  function: string // name of the check function which resulted in error
  error: typeof Error // error object thrown from the check function
  message: string // error.message (for quicker access instead of double deconstruct)
}

/* -------------------------------------------------------------------------- */
/*                            Eformless context API                           */
/* -------------------------------------------------------------------------- */
export type ListedForms = {
  [form: string]: FormType
}

export type ContextType = {
  forms: ListedForms
  addForm: (addedForm: FormType) => void
  removeForm: (removedForm: string) => void
  addFieldToForm: <T>(field: FieldType<T>, formName: keyof ListedForms) => void
  removeFieldFromForm: (filedName: string, formName: keyof ListedForms) => void
  clear: () => void
}
