import React, { DetailedHTMLProps, InputHTMLAttributes } from 'react'
import { fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useField } from '../index'
import { CheckFunction, FieldType } from '../@types'

type Props<T> = Pick<FieldType<T>, 'name' | 'value'> &
  DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    cfs?: CheckFunction<T>[],
  }

// the constraint is required in .tsx file, otherwise <T> causes parsing error
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
const Input = <T extends unknown>({
  name,
  value,
  cfs,
  ...inputProps
}: Props<T>) => {
    const [field, onChange] = useField({ name, value }, ...(cfs || []))
    return (
      <fieldset>
        <input
          value={field.value}
          name={field.name}
          id={field.name}
          onChange={onChange}
          {...inputProps}
        />
        <label data-testid="error" htmlFor={field.name}>{field.errorMessage}</label>
      </fieldset>
    )
  }

const minLen = (len: number) => (inp: string) => {
  if (inp.length < len) {
    throw Error(`Must be at least ${len} characters long`)
  }
  return
}

describe('Main functionality', () => {
  test('Initial render', () => {
    const { getByRole } = render(<Input value="test" name="input" />)
    expect(getByRole('textbox')).toHaveValue('test')
  })
  test('onChange', () => {
    const { getByRole } = render(<Input value="foo" name="input" />)
    fireEvent.change(getByRole('textbox'), { target: { value: 'bar' }})
    expect(getByRole('textbox')).toHaveValue('bar')
  })
  test('Error handling', () => {
    const {
      getByRole,
      getByLabelText,
      getByTestId,
    } = render(<Input value="foo" name="input" cfs={[minLen(3)]} />)
    expect(getByTestId('error')).not.toEqual('Must be at least 3 characters long')
    fireEvent.change(getByRole('textbox'), { target: { value: 'ba' }})
    expect(getByLabelText('Must be at least 3 characters long')).toBeVisible()
  })
})
