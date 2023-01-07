import React, { DetailedHTMLProps, InputHTMLAttributes } from 'react'
import { fireEvent, render } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import '@testing-library/jest-dom'
import { useField } from '../index'
import { CheckFunction, ErrorOn, Field } from '../types'
import { act } from 'react-dom/test-utils'

type Props<T> = Pick<Field<T>, 'name' | 'value'> &
  DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    cfs?: CheckFunction<T>[]
  }

// the constraint is required in .tsx file, otherwise <T> causes parsing error
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
const Input = ({ name, value, cfs, ...inputProps }: Props<typeof value>) => {
  const field = useField(name, value, ...(cfs || []))
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
        {field.error?.message}
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
    <V extends unknown>(errorOn: ErrorOn[] = ['error']) =>
    (val: V) => {
      if (errorOn.includes('error')) {
        if (!val) {
          throw Error('Must be truthy')
        }
        return
      }
      if (errorOn.includes('string')) {
        if (!val) {
          return 'Must be truthy (str)'
        }
        return ''
      }
      if (errorOn.includes('boolean')) {
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
    const { result } = renderHook(() => useField('hello', ''))
    expect(result.current.value).toBe('')
    expect(result.current.name).toBe('hello')
  })
  test('Shorthand', () => {
    const { result } = renderHook(() => useField('hello', undefined))
    expect(result.current.value).toBe(undefined)
    expect(result.current.name).toBe('hello')
  })
})

describe('Type-check initialization', () => {
  test('Standard - number', () => {
    const { result } = renderHook(() => useField('hello', 1))
    expect(typeof result.current.value).toBe('number')
  })
  test('Standard - string', () => {
    const { result } = renderHook(() => useField('hello', ''))
    expect(typeof result.current.value).toBe('string')
  })
  test('Standard - boolean', () => {
    const { result } = renderHook(() => useField('hello', true))
    expect(typeof result.current.value).toBe('boolean')
  })
  test('Standard - object', () => {
    const { result } = renderHook(() => useField('hello', { foo: 'bar' }))
    expect(typeof result.current.value).toBe('object')
  })
})

describe('Type-check onChange', () => {
  test('Standard number', () => {
    const { result } = renderHook(() => useField('hello', 1))
    act(() => {
      result.current.onChange(2)
    })
    expect(result.current.value).toBe(2)
  })
  test('Standard string', () => {
    const { result: result2 } = renderHook(() => useField('hello', 'foo'))
    act(() => {
      result2.current.onChange('bar')
    })
    expect(result2.current.value).toBe('bar')
  })
  test('Standard boolean', () => {
    const { result: result3 } = renderHook(() => useField('hello', true))
    act(() => {
      result3.current.onChange(false)
    })
    expect(result3.current.value).toBe(false)
  })
  test('Standard object (same shape)', () => {
    const { result: result4 } = renderHook(() => useField('hello', { a: 'foo' }))
    act(() => {
      result4.current.onChange({ a: 'bar' })
    })
    expect(result4.current.value).toEqual({ a: 'bar' })
  })
  test('Standard array / tuple (same shape)', () => {
    const { result: result5 } = renderHook(() => useField('hello', [1, 2, 3]))
    act(() => {
      result5.current.onChange([4, 5, 6])
    })
    expect(result5.current.value).toEqual([4, 5, 6])
  })
  test('Object - different shape', () => {
    const { result: result6 } = renderHook(() =>
      useField<{ a?: string; b?: string }>('hello', { a: 'foo' }),
    )
    act(() => {
      result6.current.onChange({ b: 'bar' })
    })
    expect(result6.current.value).toEqual({ b: 'bar' })
  })
  test('Array / Tuple - different size', () => {
    const { result: result7 } = renderHook(() => useField('hello', [1, 2, 3]))
    act(() => {
      result7.current.onChange([4, 5, 6, 7])
    })
    expect(result7.current.value).toEqual([4, 5, 6, 7])
  })
  test('Array / Tuple - different type', () => {
    const { result: result8 } = renderHook(() => useField<string[] | number[]>('hello', [1, 2, 3]))
    act(() => {
      result8.current.onChange(['4', '5', '6'])
    })
    expect(result8.current.value).toEqual(['4', '5', '6'])
  })
})

describe('Type-check - checkFunction', () => {
  test('Proper type', () => {
    const { result } = renderHook(() => useField('hello', 1, truthy(['error'])))
    act(() => {
      result.current.onChange(0)
    })
    expect(result.current.error?.message).toBe('Must be truthy')
  })
  test('Proper type - string', () => {
    const { result } = renderHook(() =>
      useField('hello', 1, { errorOn: ['string'] }, truthy(['string'])),
    )
    act(() => {
      result.current.onChange(0)
    })
    expect(result.current.error?.message).toBe('Must be truthy (str)')
  })
  test('Proper type - boolean', () => {
    const { result } = renderHook(() =>
      useField('x', 'a', { errorOn: ['boolean'] }, truthy(['boolean'])),
    )
    act(() => {
      result.current.onChange('')
    })
    expect(result.current.error?.message).toBe('x is invalid with value: ')
  })
  test('Multiple matches', () => {
    const { result } = renderHook(() =>
      useField('hello', 1, { errorOn: ['error', 'string'] }, truthy(['error'])),
    )
    act(() => {
      result.current.onChange(0)
    })
    expect(result.current.error?.message).toBe('Must be truthy')
  })
  test('False positive', () => {
    const { result } = renderHook(() =>
      useField('hello', 1, { errorOn: ['error'] }, truthy(['string'])),
    )
    act(() => {
      result.current.onChange(0)
    })
    expect(result.current.error?.message).toBe(undefined)
  })
})

describe('Type-check - exact types', () => {
  test('Exact match - uninitialized', () => {
    const { result } = renderHook(() => useField<string | undefined>('x', undefined))
    act(() => {
      result.current.onChange('hello')
    })
    expect(result.current.value).toBe('hello')
  })
})
