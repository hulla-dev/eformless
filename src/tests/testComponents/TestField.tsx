import React from 'react'
import useField from '../../useField'
import { CheckFunction } from '../../@types'

export type Props<T> = {
  type: string
  testId: string
  name: string
  initialValue: T
  checkFunctions?: CheckFunction<T>[]
}

type ReactComponent = <T>(props: Props<T>) => JSX.Element

// We allow incorrect types for sake of testing
/* eslint-disable @typescript-eslint/ban-ts-comment */
const TestField: ReactComponent = (props) => {
  const { type, testId, initialValue, name, checkFunctions = [] } = props
  const [field, onChange, onBlur] = useField({
    value: initialValue,
    name,
    checkFunctions,
  })

  return (
    <React.Fragment>
      <label data-testid="errorMessage">{((field.errors || [])[0] || {}).message || ''}</label>
      <input
        data-testid={testId}
        type={type}
        // @ts-ignore
        value={field.value}
        name={field.name}
        // @ts-ignore
        checked={field.value}
        onChange={onChange}
        onBlur={onBlur}
      />
    </React.Fragment>
  )
}

export default TestField
