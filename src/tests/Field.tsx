import React from 'react'
import type { DetailedHTMLProps, InputHTMLAttributes } from 'react'
import useField from '../useField'
import type { CheckFunction } from '../@types/index'

type InputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

type Props = { 
  value: any,
  name: string
  checkFunctions?: CheckFunction<any>[]
} & InputProps


/**
 * Helper component for testing useField
 * @returns React component with initialized useState
 */
const Field = (props: Props) => {
  const { value, name, checkFunctions, ...inputProps } = props
  const [field, onChange, onBlur] = useField({ value, name, checkFunctions })
  return (
    <fieldset>
      <label htmlFor={name}>{name}</label>
      <input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        {...inputProps}
      />
      <legend data-testid="error">{field.error ? field.error : 'Correct'}</legend>
      <legend data-testid="error count">{`${field.errors?.length || 0} errors`}</legend>
    </fieldset>
  )
}

export default Field
