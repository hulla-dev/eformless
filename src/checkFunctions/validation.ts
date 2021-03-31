export const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/gi
export const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/g

export const isValidEmail = (input: string): boolean => !!input.match(emailRegex)
export const isValidPhone = (input: string): boolean => !!input.match(phoneRegex)

export default {
  isValidEmail,
  isValidPhone,
}
