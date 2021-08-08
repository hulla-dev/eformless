export const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/gi
export const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/g

export const isValidEmail = (input: string): boolean => !!input.match(emailRegex)
export const isValidPhone = (input: string): boolean => !!input.match(phoneRegex)
export const isValidPassword = (length: number, requireNumber: boolean) => (
  input: string,
): boolean => {
  if (!(input.length >= length)) {
    throw Error(`Password must be at least ${length} characters long`)
  }

  if (requireNumber && !input.match(/[0-9]/g)) {
    throw Error(`Password must contain at least 1 number`)
  }

  return true
}

export default {
  isValidEmail,
  isValidPhone,
  isValidPassword,
}
