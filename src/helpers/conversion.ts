import type { ChangeEvent, SyntheticEvent } from 'react'
import type { HandlerEvents } from '../types'
import { isNativeEvent, isNativeWebEvent } from './typeguards'

/**
 * Due to `React.ChangeEvent<T>` hard-coercing all `<input>` values to typeof string we are forced
 * to coerce the values back manually in this hackish way
 * @type The attributes here reflect what is defined in
 * `typescript/lib.dom.d.ts` `HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement`
 * @param value {string} The value passed from `<input>`
 * @param checked {boolean} The checked property of `<input>`
 * @param type {string} passed type attribute (default type="text")
 */
export const convertBackToType = (value: string, checked: boolean, type: string): unknown => {
  switch (type) {
    // numerics
    case 'number':
    case 'range':
      return Number(value)
    // booleans
    case 'checkbox':
    case 'radio':
      return checked
    // dates
    case 'date':
    case 'datetime-local':
      return new Date(value)
    // Corner case - Unsupported type
    case 'file':
    case 'image':
    case 'button':
    case 'reset':
    case 'hidden':
    case 'submit':
      throw new Error(`The type of ${type} is unsupported as it an uncontrolled type in React.
      Please refer to: https://reactjs.org/docs/uncontrolled-components.html for more info.
      
      This likely is a mistake and you did not intend to pass onChange / onBlur handler here in
      the first place`)
    // Corner case - Deprecated type
    case 'datetime':
      throw new Error("Detected deprecated input type 'datetime'. Use 'datetime-local' instead")
    // represents all the remaining <input type=""> attributes, all of them are string
    default:
      return value
  }
}

export const extractValue = <T, V extends T>(event: HandlerEvents<T>, prev: V): T => {
  if (isNativeWebEvent(event)) {
    // Here we don't mind falsely converting HTMLTextAreaElement to InputElement.
    // They share for us relevant properties and the fact checked does not exist
    // on text area element does not matter to us
    const { value, checked, type } = (event as ChangeEvent<HTMLInputElement>).target
    return convertBackToType(value, checked, type) as T
  }
  if (isNativeEvent(event)) {
    // we can be guaranteed T = string in this case
    return event.nativeEvent.text as unknown as T
  }

  if (
    (event as SyntheticEvent).constructor.name === 'SyntheticEvent' &&
    (event as SyntheticEvent).target === null &&
    (event as SyntheticEvent).nativeEvent === null
  ) {
    // Fallback - if blur happened with no input
    // we need to prevent passing entire event to the value
    // and persisting the event creating memory leak
    return prev
  }
  // otherwise we fall back to whatever value was passed as first argument
  return event
}
