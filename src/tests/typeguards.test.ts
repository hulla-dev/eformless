import { isNativeWebEvent } from "../helpers/typeguards"

describe('Typeguards test', () => {
  test('[isNativeWebEvent] - target value', () => {
    expect(isNativeWebEvent({ target: { value: 'hello '}})).toEqual(true)
  })
  test('[isNativeWebEvent] - not native event', () => {
    expect(isNativeWebEvent({ target: { foo: 'hi' }})).toEqual(false)
  })
  test('[isNativeWebEvent] - value wrong type', () => {
    expect(isNativeWebEvent({ target: { value: 1 }})).toEqual(false)
  })
  test('[isNativeWebEvent] - checked false', () => {
    expect(isNativeWebEvent({ target: { checked: false }})).toEqual(true)
  })
  test('[isNativeWebEvent] - value + checked', () => {
    expect(isNativeWebEvent({ target: { value: '', checked: false}})).toEqual(true)
  })
})