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

export let config: Config = {
  errorOn: ['error'],
  inferKeyboard: true,
  coerceBack: true,
  comparator,
  checkAdapter: null,
  warnOnTypeMismatch: true,
}

export const setConfig = (newConfig: Partial<Config>): void => {
  config = {
    ...config,
    ...newConfig,
  }
}

export const getConfig = (): Config => config
