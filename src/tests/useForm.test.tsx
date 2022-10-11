import React, { useEffect } from 'react'
import { useField, useForm } from '../index'
import '@testing-library/jest-dom'
import { renderHook } from '@testing-library/react-hooks'
import { fireEvent, render } from '@testing-library/react'

const Form = () => {
  const name = useField({ name: 'name', value: '', errorOn: 'string' }, (val) =>
    !val ? 'Required' : '',
  )
  const age = useField({ name: 'age', value: 12, errorOn: 'string' }, (val) =>
    val < 18 ? 'Must be 18 or older' : '',
  )
  const form = useForm(name, age)
  const field = useField({ name: 'test', value: 'test' })
  useEffect(() => {
    form.add(field)
  }, [])

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
      <p>Field-changed: {String(name.changed)}</p>
      <p>Changed: {String(form.changed)}</p>
      <p>Blurred: {String(form.blurred)}</p>
    </div>
  )
}

describe('Main functionality', () => {
  test('Initial form setup', () => {
    const {
      result: { current: age },
    } = renderHook(() => useField({ name: 'age', value: 12 }))
    const {
      result: { current: name },
    } = renderHook(() => useField({ name: 'name', value: 'foo' }))
    const {
      result: { current: form },
    } = renderHook(() => useForm(age, name))
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
      useField({ name: 'name', value: '', errorOn: 'string' }, (val) =>
        !val ? 'Must not be empty' : '',
      ),
    )
    const { result } = renderHook(() => useForm(name))
    expect(result.current.error).toBe(true)
  })
})

describe('Interactions', () => {
  test('No activity', () => {
    const {
      result: { current: name },
    } = renderHook(() => useField({ name: 'name', value: '' }))
    const { result } = renderHook(() => useForm(name))
    expect(result.current.changed).toBe(false)
    expect(result.current.blurred).toBe(false)
    expect(result.current.allChanged).toBe(false)
    expect(result.current.allBlurred).toBe(false)
  })
})
