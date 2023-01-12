/* eslint-disable @typescript-eslint/no-explicit-any */
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
  message: string
  error: E
}

export type EventHandler<T> = (event: HandlerEvents<T>) => void

export type CheckFunction<T> = (value: T) => any

type ValueKey<K extends Partial<Config['valueKey'] | undefined>> = K extends undefined ? 'value' : K

type OptionalProps<T, X extends Partial<Config>> = {
  [K in ValueKey<X['valueKey']>]: T
} & X['inferKeyboard'] extends true
  ? X['platform'] extends 'web'
    ? {
        inputMethod: 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'
      }
    : {
        keyboardType:
          | 'default'
          | 'email-address'
          | 'numeric'
          | 'phone-pad'
          | 'decimal-pad'
          | 'web-search'
          | 'url'
      }
  : Record<string, never> & X['inferAutoCapitalize'] extends true
  ? { autoCapitalize: 'none' | 'sentences' | 'words' | 'characters' }
  : Record<string, never>

export type Props<
  T,
  E = Error,
  C extends CheckFunction<T> = CheckFunction<T>,
  X extends Partial<Config> = Config,
> = Pick<Field<T, E, C, X>, 'name' | 'onChange' | 'onBlur'> & OptionalProps<T, X>

export type Field<
  T,
  E = Error,
  C extends CheckFunction<T> = CheckFunction<T>,
  X extends Partial<Config> = Config,
> = {
  value: T
  name: string
  checkResults: Array<ReturnType<C> | FieldError<T, E>>
  error?: FieldError<T, E>
  errors?: FieldError<T, E>[]
  isError: boolean
  isChanged: boolean
  isBlurred: boolean
  isDifferent: boolean
  onChange: EventHandler<T>
  onBlur: EventHandler<T>
  props: Props<T, E, C, X>
}

export type ErrorOn = 'error' | 'string' | 'boolean'

export type Platform = 'web' | 'native'

type BaseConfig = {
  allow: undefined | ((value: any) => boolean)
  errorOn: ErrorOn[]
  checkAdapter: ((value: any) => any) | undefined
  comparator: <T>(a: T, b: T) => boolean
  coerceBack: boolean
  inferKeyboard: boolean
  inferAutoCapitalize: boolean
  platform: Platform
  valueKey: string
  warnOnTypeMismatch: boolean
}

export type Config<T extends 'global' | 'field' = 'field'> = T extends 'field'
  ? BaseConfig & { ready: boolean }
  : BaseConfig

export type CoercedValue<
  T,
  X extends Config,
  Y extends 'radio' | 'checkbox' | string,
> = X['coerceBack'] extends true ? T : Y extends 'radio' | 'checkbox' ? boolean : string

export type FieldMap<M extends Record<string, unknown>> = M extends {
  [K in keyof M]: M[K] extends Field<infer T, infer E, infer C, infer X> ? Field<T, E, C, X> : never
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
  isDifferent: boolean
  isAllError: boolean
  isAllChanged: boolean
  isAllBlurred: boolean
  isAllValid: boolean
  isAllDifferent: boolean
}
