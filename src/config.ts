import { Config } from './types'

const comparator = <T>(a: T, b: T) => {
  if (typeof a === 'object' && typeof b === 'object') {
    if (
      ((a as Record<string, unknown>).constructor.name === 'Object' &&
        (b as Record<string, unknown>).constructor.name === 'Object') ||
      (Array.isArray(a) && Array.isArray(b))
    ) {
      return JSON.stringify(a) === JSON.stringify(b)
    }
    if (Array.isArray(a) && Array.isArray(b)) {
      return JSON.stringify(a) === JSON.stringify(b)
    }
  }
  return Object.is(a, b)
}

export let config: Config<'global'> = {
  allow: undefined,
  errorOn: ['error'],
  coerceBack: true,
  comparator,
  checkAdapter: undefined,
  inferAutoCapitalize: false,
  inferKeyboard: true,
  valueKey: 'value',
  platform: 'web',
  warnOnTypeMismatch: true,
}

export const setConfig = (newConfig: Partial<Config<'global'>>): void => {
  config = {
    ...config,
    ...newConfig,
  }
}

export const getConfig = (): Config<'global'> => config
