import type { ChangeEvent } from 'react'
import type { NativeSyntheticEvent, TextInputChangeEventData } from 'react-native'

export type ExactOptions = 'exact' | 'shape' | 'normal'

export type HandlerEvents<T> =
  | ChangeEvent<HTMLInputElement>
  | ChangeEvent<HTMLTextAreaElement>
  | NativeSyntheticEvent<TextInputChangeEventData>
  | T

/* -------------------------------------------------------------------------- */
/*                              1. Field Handling                             */
/* -------------------------------------------------------------------------- */

export type FieldValue<T> = T extends undefined ? string : T

export type FieldType<T> = {
  value: T
  name: string
  blurred: boolean
  changed: boolean
  error: boolean
  errors?: ErrorType<T>[]
  errorMessage: string
  onChange: FieldHandlerFunction<T>
  onBlur: FieldHandlerFunction<T>
}

export type FieldInitialization<V> = {
  name: string
  value?: V
  errorOn?: ErrorOnOptions | ErrorOnOptions[]
  checkFunctions?: CheckFunction<FieldValue<V>>[]
}

export type ReadyFieldInitialization<T> = Omit<FieldInitialization<T>, 'value'> & {
  value: T extends undefined ? string : T
}

export type CheckFunction<T> = (value: T, ...args: unknown[]) => unknown

export type FieldHandlerFunction<T> = (event: HandlerEvents<T>) => void

/* -------------------------------------------------------------------------- */
/*                                2. Form Types                               */
/* -------------------------------------------------------------------------- */

export type FormFields<T extends unknown[]> = T extends [infer Field, ...infer Rest]
  ? Field extends { value: infer V }
    ? { [key: FieldType<V>['name']]: FieldType<V> } & FormFields<Rest>
    : never
  : T

export type FormType<T extends Array<FieldType<unknown>>> = {
  fields: FormFields<T>
  add: <T>(field: FieldType<T>) => void
  remove: (fieldName: keyof FormFields<T>) => void
  changed: boolean
  blurred: boolean
  error: boolean
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
