import React, { createContext, useContext, useState } from 'react'
import type { ContextType, FieldType, FormType, ListedForms } from './@types'
import { merge, objectMap, omit } from './helpers/objects'

const EformlessContext = createContext<ContextType | undefined>(undefined)

/**
 * Creates a redux-like store for managing form values
 */
const Eformless = (props: { children: React.ReactNode }): JSX.Element => {
  const [eformless, setEformless] = useState<ListedForms>({})

  const addForm = (addedForm: FormType) =>
    setEformless((prevState) => merge(prevState, { [addedForm.name]: addedForm }))

  const removeForm = (removedFormName: keyof ListedForms) =>
    setEformless((prevState) => omit(removedFormName, prevState))

  const addFieldToForm = (field: FieldType<unknown>, formName: keyof ListedForms) => {
    if (!eformless[formName]) {
      throw Error(
        `[Eformless-Error]: Form ${formName} does not currently exist on eformless context.
          Make sure to add it via 'addForm' first`,
      )
    } else {
      setEformless((prevState) => ({
        [formName]: {
          ...prevState[formName],
          fields: merge(prevState[formName].fields, { [field.name]: field }),
        },
        ...prevState,
      }))
    }
  }

  const removeFieldFromForm = (fieldName: string, formName: keyof ListedForms) => {
    if (
      !Object.keys(eformless[formName].fields)
        .map((name) => name)
        .includes(fieldName)
    ) {
      console.warn(
        `[Eformless-Warning]: Form ${formName} does not contain field with name ${fieldName}.
         Skipping the removal`,
      )
    } else {
      setEformless((prevState) => ({
        [formName]: {
          ...prevState[formName],
          fields: omit(fieldName, prevState[formName].fields),
        },
      }))
    }
  }

  const clear = (formName?: keyof ListedForms) => {
    // Clears a single field value
    const clearFieldValue = (field: FieldType<unknown>) => ({
      ...field,
      value: undefined,
    })
    // Clears all field values inside a form
    const clearAllFields = (form: FormType) => ({
      ...form,
      fields: objectMap(form.fields, clearFieldValue),
    })
    // If form was specified, we clear a speicic form
    if (formName) {
      if (formName in eformless) {
        setEformless((prevState) => ({
          [formName]: {
            ...prevState[formName],
            fields: objectMap(prevState[formName].fields, clearFieldValue),
          },
        }))
      } else {
        console.warn(`Form ${formName} does not exist. Nothing was cleared!`)
      }
      // Otherwise we clear all forms
    } else {
      setEformless((prevState) => objectMap(prevState, clearAllFields))
    }
  }

  return (
    <EformlessContext.Provider
      value={{ forms: eformless, addForm, removeForm, addFieldToForm, removeFieldFromForm, clear }}
      {...props}
    />
  )
}

const useEformless = (): ContextType | undefined => useContext(EformlessContext)

export { useEformless, Eformless }
