import React, { DetailedHTMLProps, InputHTMLAttributes } from 'react'
import { fireEvent, render } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import '@testing-library/jest-dom'
import { useField } from '../index'
import { CheckFunction, ErrorOnOptions, FieldType } from '../types'
import { act } from 'react-dom/test-utils'
import { isOrIncludes } from '../helpers/arrays'

type Props<T> = Pick<FieldType<T>, 'name' | 'value'> &
  DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    cfs?: CheckFunction<T>[]
  }

// the constraint is required in .tsx file, otherwise <T> causes parsing error
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
const Input = ({ name, value, cfs, ...inputProps }: Props<typeof value>) => {
  const field = useField({ name, value }, ...(cfs || []))
  return (
    <fieldset>
      <input
        value={field.value}
        name={field.name}
        id={field.name}
        onChange={field.onChange}
        {...inputProps}
      />
      <label data-testid="error" htmlFor={field.name}>
        {field.errorMessage}
      </label>
    </fieldset>
  )
}

const minLen = (len: number) => (inp: string) => {
  if (inp.length < len) {
    throw Error(`Must be at least ${len} characters long`)
  }
  return
}

/**
 * Helper text function to simulate all possible error return types
 * @param val any value to pass
 * @param errorOn Possible error on returns (simulates these CFs)
 * @returns Correct checkFunction format
 */
const truthy =
  // eslint-disable-next-line prettier/prettier
     // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
    <V extends unknown>(errorOn: ErrorOnOptions | ErrorOnOptions[] = 'error') =>
    (val: V) => {
      if (isOrIncludes(errorOn, 'error')) {
        if (!val) {
          throw Error('Must be truthy')
        }
        return
      }
      if (isOrIncludes(errorOn, 'string')) {
        if (!val) {
          return 'Must be truthy (str)'
        }
        return ''
      }
      if (isOrIncludes(errorOn, 'boolean')) {
        if (!val) {
          return false
        }
        return true
      }
    }

describe('Main functionality', () => {
  test('Initial render', () => {
    const { getByRole } = render(<Input value="test" name="input" />)
    expect(getByRole('textbox')).toHaveValue('test')
  })
  test('onChange', () => {
    const { getByRole } = render(<Input value="foo" name="input" />)
    fireEvent.change(getByRole('textbox'), { target: { value: 'bar' } })
    expect(getByRole('textbox')).toHaveValue('bar')
  })
  test('Error handling', () => {
    const { getByRole, getByLabelText, getByTestId } = render(
      <Input value="foo" name="input" cfs={[minLen(3)]} />,
    )
    expect(getByTestId('error')).not.toEqual('Must be at least 3 characters long')
    fireEvent.change(getByRole('textbox'), { target: { value: 'ba' } })
    expect(getByLabelText('Must be at least 3 characters long')).toBeVisible()
  })
})

describe('Ways of initialization', () => {
  test('Standard', () => {
    const { result } = renderHook(() => useField({ name: 'hello', value: '' }))
    expect(result.current.value).toBe('')
    expect(result.current.name).toBe('hello')
  })
  test('Shorthand', () => {
    const { result } = renderHook(() => useField({ name: 'hello' }))
    expect(result.current.value).toBe('')
    expect(result.current.name).toBe('hello')
  })
})

describe('Type-check initialization', () => {
  test('Standard - number', () => {
    const { result } = renderHook(() => useField({ name: 'hello', value: 1 }))
    expect(typeof result.current.value).toBe('number')
  })
  test('Standard - string', () => {
    const { result } = renderHook(() => useField({ name: 'hello', value: '' }))
    expect(typeof result.current.value).toBe('string')
  })
  test('Standard - boolean', () => {
    const { result } = renderHook(() => useField({ name: 'hello', value: true }))
    expect(typeof result.current.value).toBe('boolean')
  })
  test('Standard - object', () => {
    const { result } = renderHook(() => useField({ name: 'hello', value: { a: 'foo' } }))
    expect(typeof result.current.value).toBe('object')
  })
})

describe('Type-check onChange', () => {
  test('Standard number', () => {
    const { result } = renderHook(() => useField({ name: 'hello', value: 1 }))
    act(() => {
      result.current.onChange(2)
    })
    expect(result.current.value).toBe(2)
  })
  test('Standard string', () => {
    const { result: result2 } = renderHook(() => useField({ name: 'hello', value: '' }))
    act(() => {
      result2.current.onChange('bar')
    })
    expect(result2.current.value).toBe('bar')
  })
  test('Standard boolean', () => {
    const { result: result3 } = renderHook(() => useField({ name: 'hello', value: true }))
    act(() => {
      result3.current.onChange(false)
    })
    expect(result3.current.value).toBe(false)
  })
  test('Standard object (same shape)', () => {
    const { result: result4 } = renderHook(() => useField({ name: 'hello', value: { a: 'foo' } }))
    act(() => {
      result4.current.onChange({ a: 'bar' })
    })
    expect(result4.current.value).toEqual({ a: 'bar' })
  })
  test('Standard array / tuple (same shape)', () => {
    const { result: result5 } = renderHook(() => useField({ name: 'hello', value: [1, 2, 3] }))
    act(() => {
      result5.current.onChange([4, 5, 6])
    })
    expect(result5.current.value).toEqual([4, 5, 6])
  })
  test('Object - different shape', () => {
    const { result: result6 } = renderHook(() =>
      useField<{ a?: string; b?: string }>({ name: 'hello', value: { a: 'foo' } }),
    )
    act(() => {
      result6.current.onChange({ b: 'bar' })
    })
    expect(result6.current.value).toEqual({ b: 'bar' })
  })
  test('Array / Tuple - different size', () => {
    const { result: result7 } = renderHook(() => useField({ name: 'hello', value: [1, 2, 3] }))
    act(() => {
      result7.current.onChange([4, 5, 6, 7])
    })
    expect(result7.current.value).toEqual([4, 5, 6, 7])
  })
  test('Array / Tuple - different type', () => {
    const { result: result8 } = renderHook(() =>
      useField<string[] | number[]>({ name: 'hello', value: [1, 2, 3] }),
    )
    act(() => {
      result8.current.onChange(['4', '5', '6'])
    })
    expect(result8.current.value).toEqual(['4', '5', '6'])
  })
})

describe('Type-check - checkFunction', () => {
  test('Proper type', () => {
    const { result } = renderHook(() => useField({ name: 'hello', value: 1 }, truthy('error')))
    act(() => {
      result.current.onChange(0)
    })
    expect(result.current.errorMessage).toBe('Must be truthy')
  })
  test('Proper type - string', () => {
    const { result } = renderHook(() =>
      useField({ name: 'hello', value: 1, errorOn: 'string' }, truthy('string')),
    )
    act(() => {
      result.current.onChange(0)
    })
    expect(result.current.errorMessage).toBe('Must be truthy (str)')
  })
  test('Proper type - boolean', () => {
    const { result } = renderHook(() =>
      useField({ name: 'x', value: 'a', errorOn: 'boolean' }, truthy('boolean')),
    )
    act(() => {
      result.current.onChange('')
    })
    expect(result.current.errorMessage).toBe(' check failed with value: false')
  })
  test('Multiple matches', () => {
    const { result } = renderHook(() =>
      useField({ name: 'hello', value: 1, errorOn: ['error', 'string'] }, truthy('error')),
    )
    act(() => {
      result.current.onChange(0)
    })
    expect(result.current.errorMessage).toBe('Must be truthy')
  })
  test('False positive', () => {
    const { result } = renderHook(() =>
      useField({ name: 'hello', value: 1, errorOn: 'error' }, truthy('string')),
    )
    act(() => {
      result.current.onChange(0)
    })
    expect(result.current.errorMessage).toBe('')
  })
})

describe('Type-check - exact types', () => {
  test('Exact match - uninitialized', () => {
    const { result } = renderHook(() => useField({ name: 'x' }))
    act(() => {
      result.current.onChange('hello')
    })
    expect(result.current.value).toBe('hello')
  })
})
