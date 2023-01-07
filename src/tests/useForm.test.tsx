import React from 'react'
import { useField, useForm } from '../index'
import '@testing-library/jest-dom'
import { renderHook } from '@testing-library/react-hooks'
import { fireEvent, render } from '@testing-library/react'

const Form = () => {
  const name = useField('name', '', { errorOn: ['string'] }, (val) => (!val ? 'Required' : ''))
  const age = useField('age', 12, { errorOn: ['string'] }, (val) =>
    val < 18 ? 'Must be 18 or older' : '',
  )
  const form = useForm({ name, age })
  return (
    <div>
      {Object.keys(form.fields).map((key) => (
        <p key={key}>{key}</p>
      ))}
      {form.errors?.map((err) => (
        <p key={err.message}>{err.message}</p>
      ))}
      <input
        type="text"
        name={name.name}
        onChange={name.onChange}
        onBlur={name.onBlur}
        value={name.value}
      />
      <p>Field-changed: {String(name.isChanged)}</p>
      <p>Changed: {String(form.isChanged)}</p>
      <p>Blurred: {String(form.isBlurred)}</p>
    </div>
  )
}

describe('Main functionality', () => {
  test('Initial form setup', () => {
    const {
      result: { current: age },
    } = renderHook(() => useField('age', 12))
    const {
      result: { current: name },
    } = renderHook(() => useField('name', 'foo'))
    const {
      result: { current: form },
    } = renderHook(() => useForm({ age, name }))
    expect(Object.values(form.fields).map((f) => f.value)).toEqual([12, 'foo'])
  })
  test('Add field', () => {
    const { getByText } = render(<Form />)
    expect(getByText('test')).toBeVisible()
  })
  test('Error handling', () => {
    const { getByText } = render(<Form />)
    expect(getByText('Must be 18 or older')).toBeVisible()
  })
  test('Has error', () => {
    const {
      result: { current: name },
    } = renderHook(() =>
      useField('name', '', { errorOn: 'string' }, (val) => (!val ? 'Must not be empty' : '')),
    )
    const { result } = renderHook(() => useForm({ name }))
    expect(result.current.isError).toBe(true)
  })
})

describe('Interactions', () => {
  test('No activity', () => {
    const {
      result: { current: name },
    } = renderHook(() => useField('name', ''))
    const { result } = renderHook(() => useForm({ name }))
    expect(result.current.isChanged).toBe(false)
    expect(result.current.isBlurred).toBe(false)
    expect(result.current.isAllChanged).toBe(false)
    expect(result.current.isAllBlurred).toBe(false)
  })
  test('Activity', () => {
    const { getByText, getByRole } = render(<Form />)
    expect(getByText('Changed: false')).toBeVisible()
    expect(getByText('Blurred: false')).toBeVisible()
    fireEvent.change(getByRole('textbox'), { target: { value: 'foo' } })
    expect(getByText('Changed: true')).toBeVisible()
    expect(getByText('Blurred: false')).toBeVisible()
  })
})
