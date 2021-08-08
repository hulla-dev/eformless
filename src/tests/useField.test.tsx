import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import useField from '../useField'
import TestField, { Props as TestFieldProps } from './testComponents/TestField'
import { isValidEmail, isValidPassword } from '../checkFunctions/validation'

export const setupTextField = <T extends unknown>(
  props: TestFieldProps<T>,
): { input: EventTarget & HTMLInputElement } => {
  const utils = render(<TestField {...props} />)
  const input = screen.getByTestId(props.testId) as EventTarget & HTMLInputElement
  return {
    input,
    ...utils,
  }
}

describe('basic useField functionality', () => {
  test('Initialization', () => {
    const { input } = setupTextField({
      initialValue: '',
      name: 'textInput',
      testId: 'input',
      type: 'text',
    })
    expect(input.value).toBeUndefined
  })

  test('Text Change', async () => {
    const { input } = setupTextField({
      initialValue: '',
      name: 'textInput',
      testId: 'changeInput',
      type: 'text',
    })
    fireEvent.change(input, { target: { value: 'test' } })
    expect(input.value).toBe('test')
  })

  test('Boolean toggles', () => {
    const { input: checkbox } = setupTextField({
      testId: 'checkbox',
      type: 'checkbox',
      initialValue: false,
      name: 'checkbox',
    })
    const { input: radio } = setupTextField({
      testId: 'radio',
      name: 'radio',
      type: 'radio',
      initialValue: true,
    })
    expect(checkbox.checked).toBeFalsy
    expect(radio.checked).toBeTruthy
    fireEvent.change(checkbox, { target: { checked: true } })
    fireEvent.change(radio, { target: { checked: false } })
    expect(checkbox.checked).toBeTruthy
    expect(radio.checked).toBeFalsy
  })
})

describe('useField error handling', () => {
  test('Correct on initialization', () => {
    const { result } = renderHook(() =>
      useField({ value: 'valid@email.com', name: 'email', checkFunctions: [isValidEmail] }),
    )
    const [field] = result.current
    expect(typeof field.errors).toBe('undefined')
  })

  test('Error on initialization', () => {
    const { result } = renderHook(() =>
      useField({ value: 'invalid-email', name: 'email', checkFunctions: [isValidEmail] }),
    )
    const [field] = result.current
    expect(Array.isArray(field.errors)).toBe(true)
  })

  test('Customized error message', () => {
    const { result } = renderHook(() =>
      useField({ value: 'pw', name: 'password', checkFunctions: [isValidPassword(3, false)] }),
    )
    const [field] = result.current
    expect((field.errors || [])[0].message).toBe('Password must be at least 3 characters long')
  })
})
