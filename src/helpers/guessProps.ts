import type { Config, Platform } from '../types'

type KeyboardTypes = {
  phone: string
  number: string
  decimal: string
  email: string
  url: string
  default: string
  search: string
}

type Keyboard = {
  [K in Platform]: KeyboardTypes
}

const keyboard: Keyboard = {
  native: {
    phone: 'phone-pad',
    number: 'numeric',
    decimal: 'decimal-pad',
    email: 'email-address',
    url: 'url',
    default: 'default',
    search: 'web-search',
  },
  web: {
    phone: 'tel',
    number: 'number',
    decimal: 'decimal',
    email: 'email',
    url: 'url',
    default: 'text',
    search: 'search',
  },
} as const

export const guessKeyboardType = <T>(name: string, value: T, type: Platform) => {
  const query = name.toLowerCase()
  if (typeof value === 'number') {
    if (query.includes('phone') || query.includes('tel')) {
      return keyboard[type].phone
    }
    if (
      query.includes('age') ||
      query.includes('pin') ||
      query.includes('otp') ||
      query.includes('zip') ||
      query.includes('number')
    ) {
      return keyboard[type].number
    }
    return keyboard[type].decimal
  }
  if (typeof value === 'string') {
    if (query.includes('email')) {
      return keyboard[type].email
    }
    if (query.includes('phone')) {
      return keyboard[type].phone
    }
    if (
      query.includes('link') ||
      query.includes('url' || query.includes('uri')) ||
      query.includes('website')
    ) {
      return keyboard[type].url
    }
    if (query.includes('search')) {
      return keyboard[type].search
    }
  }
  return keyboard[type].default
}

// Web and native use same capitialization types

export const guessAutoCapitalize = <T>(name: string, value: T) => {
  // Note on web file type automatically overrides this on type "email", "url" and "password"
  // see: https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autocapitalize
  const query = name.toLowerCase()

  if (typeof value === 'string') {
    if (query.includes('email') || query.includes('password')) {
      return 'none'
    }
    if (query.includes('phone')) {
      return 'none'
    }
    if (query.includes('name')) {
      return 'words'
    }
    if (
      query.includes('link') ||
      query.includes('url' || query.includes('uri')) ||
      query.includes('website')
    ) {
      return 'none'
    }
  }
  return 'sentences'
}

export const guessedProps = <T, X extends Config>(name: string, value: T, config: X) => {
  const valueObj = { [config.valueKey]: value }
  const autoCapitalize = { autoCapitalize: guessAutoCapitalize(name, value) }
  const keyboardName = config.platform === 'web' ? 'inputMethod' : 'keyboardType'
  const keyboard = { [keyboardName]: guessKeyboardType(name, value, config.platform) }
  let result
  result = valueObj
  if (config.inferAutoCapitalize) {
    result = { ...result, ...autoCapitalize }
  }
  if (config.inferKeyboard) {
    result = { ...result, ...keyboard }
  }
  return result
}
