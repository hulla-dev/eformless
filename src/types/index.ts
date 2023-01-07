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

export type FieldError<T, E = Error> = {
  name: string
  value: T
} & E

export type EventHandler<T> = (event: HandlerEvents<T>) => void

export type CheckFunction<T> = (value: T) => any

export type Field<T, E = Error, C extends CheckFunction<T> = CheckFunction<T>> = {
  value: Value<T, C>
  name: string
  checkResults: ReturnType<C>[]
  error?: FieldError<T, E>
  errors?: FieldError<T, E>[]
  isError: boolean
  isChanged: boolean
  isBlurred: boolean
  onChange: EventHandler<T>
  onBlur: EventHandler<T>
}

export type Value<T, C extends CheckFunction<T>> = T extends undefined
  ? C extends undefined
    ? unknown
    : Parameters<C>[0]
  : T

export type ErrorOn = 'error' | 'string' | 'boolean'

export type Config = {
  errorOn: ErrorOn[]
  checkAdapter: ((value: any) => any) | null
  comparator: <T>(a: T, b: T) => boolean
  inferKeyboard: boolean
  coerceBack: boolean
  warnOnTypeMismatch: boolean
}

export type CoercedValue<
  T,
  X extends Config,
  Y extends 'radio' | 'checkbox' | string,
> = X['coerceBack'] extends true ? T : Y extends 'radio' | 'checkbox' ? boolean : string

export type FieldMap<M extends Record<string, unknown>> = M extends {
  [K in keyof M]: M[K] extends Field<infer T, infer E, infer C> ? Field<T, E, C> : never
}
  ? M
  : never

export type MappedErrors<M extends Record<string, unknown>> = M extends FieldMap<M>
  ? {
      [K in keyof M]: M[K] extends Field<infer T, infer E> ? FieldError<T, E> : never
    }
  : never

export type Form<M extends Record<string, unknown>, S extends (...args: any[]) => any> = {
  fields: FieldMap<M>
  errors: Array<MappedErrors<M>[keyof MappedErrors<M>]>
  submit: (...args: Parameters<S>) => S extends undefined ? void : ReturnType<S>
  isChanged: boolean
  isBlurred: boolean
  isSubmitted: boolean
  isError: boolean
  isAllError: boolean
  isAllChanged: boolean
  isAllBlurred: boolean
  isAllValid: boolean
}
