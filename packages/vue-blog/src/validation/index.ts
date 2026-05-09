export type Validator = (value: string) => true | string;

export const required: Validator = (value) => !!value || 'is required';

export const minLength = (count: number): Validator => (value) => (
  (value || '').length >= count || `should have more than ${count} characters`
);

export const maxLength = (count: number): Validator => (value) => (
  (value || '').length <= count || `should have less than ${count} characters`
);

export const email: Validator = (value) => (
  /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) || 'is not a valid email'
);
