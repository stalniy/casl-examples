export const required = v => !!v || 'is required'
export const minLength = number => v => (v || '').length >= number || `should have more than ${number} characters`
export const maxLength = number => v => (v || '').length <= number || `should have less than ${number} characters`
export const email = v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'is not a valid email'
