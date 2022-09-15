import React from 'react'
import '@testing-library/jest-dom'
import Input from './Field'
import { fireEvent, render } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import useField from '../useField'
import { act } from 'react-dom/test-utils'


describe('Main functionality', () => {
  test('Initial render', () => {
    const { getByText } = render(<Input value="test" name="input" />)
    expect(getByText('input')).toHaveTextContent('input')
    expect(getByText('Correct')).toBeDefined()
  })
  test('Error check', () => {
    const minAge = (input: number) => {
      if (input < 18) {
        throw Error('must be at least 18 years old')
      }
    }
    const {
      getByTestId,
    } = render(<Input value={12} name="age" type="number" checkFunctions={[minAge]} />)
    expect(getByTestId('error')).toHaveTextContent('must be at least 18 years old')
  })
  test('Error onChange', () => {
    const minAge = (input: number) => {
      if (input < 18) {
        throw Error('must be at least 18 years old')
      }
    }
    const {
      getByTestId,
      getByRole,
    } = render(<Input value={12} name="age" type="number" checkFunctions={[minAge]} />)
    expect(getByTestId('error')).toHaveTextContent('must be at least 18 years old')
    // note we pass string, but convertBackToType helper handles it for us
    fireEvent.change(getByRole('spinbutton'), { target: { value: '19' }}) 
    expect(getByTestId('error')).toHaveTextContent('Correct')
  })
  test('Non-native element change', () => {
    const { result } = renderHook(() => useField({ value: 'foo', name: 'Hello' }))
    const [_, onChange] = result.current
    act(() => {
      onChange('new text')
    })
    // Note, we need to check for current, because destructuring does not update value
    expect(result.current[0].value).toBe('new text')
  })
  test('Check the actual value', () => {
    const { getByRole } = render(<Input value="foo" name="input" type="text" />)
    expect(getByRole('textbox', { name: 'input'})).toHaveValue('foo')
    fireEvent.change(getByRole('textbox', { name: 'input'}), { target: { value: 'bar' }})
    expect(getByRole('textbox', { name: 'input'})).toHaveValue('bar')
  })
})
