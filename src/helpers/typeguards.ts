import type { ChangeEvent } from 'react'
import type { NativeSyntheticEvent, TextInputChangeEventData } from 'react-native'
import { FieldInitialization, ReadyFieldInitialization } from 'src/types'

export const undefinedOnEmpty = <T>(arr: T[]): T[] | undefined => (arr.length > 0 ? arr : undefined)

export const notUndefined = <T>(x: T | undefined): x is T => x !== undefined

export const notNull = <T>(x: T | null): x is T => x !== null

export const notString = <T>(x: T | string): x is T => typeof x !== 'string'
export const isValidInitialization = <T>(x: T | unknown): x is ReadyFieldInitialization<T> =>
  (x as ReadyFieldInitialization<T>).value !== undefined

type NativeWebEvent = ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>

export const isNativeWebEvent = <T>(event: NativeWebEvent | T): event is NativeWebEvent =>
  !!(
    (event as ChangeEvent<HTMLInputElement>).target &&
    (((event as ChangeEvent<HTMLInputElement>).target.value !== undefined &&
      typeof (event as ChangeEvent<HTMLInputElement>).target.value === 'string') ||
      ((event as ChangeEvent<HTMLInputElement>).target.checked !== undefined &&
        typeof (event as ChangeEvent<HTMLInputElement>).target.checked === 'boolean'))
  )

type NativeEvent = NativeSyntheticEvent<TextInputChangeEventData>
export const isNativeEvent = <T>(event: NativeEvent | T): event is NativeEvent =>
  !!(
    (event as NativeEvent).nativeEvent &&
    (event as NativeEvent).nativeEvent.text &&
    typeof (event as NativeEvent).nativeEvent.text === 'string'
  )

export const initializeField = <T>(data: FieldInitialization<T>): ReadyFieldInitialization<T> =>
  isValidInitialization<T>(data)
    ? data
    : ({
        ...data,
        value: '',
      } as ReadyFieldInitialization<T>)
