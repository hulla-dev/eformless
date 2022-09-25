import type { ChangeEvent } from 'react'
import type { NativeSyntheticEvent, TextInputChangeEventData } from 'react-native'

export type HandlerEvents<T> =
  | ChangeEvent<HTMLInputElement>
  | ChangeEvent<HTMLTextAreaElement>
  | NativeSyntheticEvent<TextInputChangeEventData>
  | T

/* -------------------------------------------------------------------------- */
/*                              1. Field Handling                             */
/* -------------------------------------------------------------------------- */
export type FieldValue<T> = T extends unknown ? string : T

export type FieldType<T> = {
  value?: T
  name: string
  blurred: boolean
  changed: boolean
  error: boolean,
  errors?: ErrorType<T>[]
  errorMessage: string,
  onChange: FieldHandlerFunction<T>,
  onBlur: FieldHandlerFunction<T>,
}

export type FieldInitialization<T> = {
  name: string,
  value?: T extends undefined ? string : T,
  errorOn?: ErrorOnOptions | ErrorOnOptions[],
  checkFunctions?: CheckFunction<T>[],
}

export type ReadyFieldInitialization<T> = {
  value: T,
} & FieldInitialization<T>

export type CheckFunction<T> = (value: T, ...args: unknown[]) => unknown

export type FieldHandlerFunction<T> = (event: HandlerEvents<T>) => void

/* -------------------------------------------------------------------------- */
/*                                2. Form Types                               */
/* -------------------------------------------------------------------------- */

export type FormType = {
  name: string
  fields: {
    [fieldName: string]: FieldType<unknown>
  }
  changed: boolean
  blurred: boolean
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

export type ErrorOnOptions = 'error' | 'string' | 'boolean'

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
