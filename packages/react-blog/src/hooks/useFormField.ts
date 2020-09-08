import { useState, ChangeEvent } from 'react';

export interface FormField<T = string> {
  error: string
  setError(value: string): void
  value: T
  setValue(value: T): void
  setValueFromEvent(event: ChangeEvent<HTMLInputElement>): void
}

export function useFormField<T = string>(defaultValue: T = '' as unknown as T): FormField<T> {
  const error = useState('');
  const value = useState<T>(defaultValue);

  return {
    error: error[0],
    setError: error[1],
    value: value[0],
    setValue: value[1],
    setValueFromEvent(event: ChangeEvent<HTMLInputElement>) {
      const newValue = event.target.type === 'checkbox' || event.target.type === 'radio'
        ? event.target.checked as unknown as T
        : event.target.value as unknown as T
      value[1](newValue);
    }
  };
}

type Form = Record<string, FormField<any>>;
type Validators<T> = {
  [K in keyof T]?: Array<{
    (value: any): boolean,
    message: string
  }>
};
type ToValues<T extends Record<any, FormField<any>>> = {
  [K in keyof T]: T[K]['value']
};

export function formToObject<T extends Form>(form: T): ToValues<T> {
  return Object.keys(form).reduce((object, name) => {
    object[name as unknown as keyof T] = form[name].value;
    return object;
  }, {} as ToValues<T>);
}

export const minLength = (min: number) => {
  const test = (value: { length: number }) => value.length >= min;
  test.message = `should be minimum ${min} characters`;
  return test;
};
export const required = (value?: string) => !!value && value.length > 0;
required.message = 'required';

export const email = (value: string) => /^\w[\w.-]*@(\w[\w.-]*)+$/.test(value);
email.message = 'is not a valid email';

export function validation<T extends Form>(validators: Validators<T>) {
  const keys = Object.keys(validators);
  return (form: T) => {
    let isValid = true;
    keys.forEach((name) => {
      const validator = validators[name]!.find(test => !test(form[name].value));

      form[name].setError(validator ? validator.message : '');
      isValid = isValid && !validator;
    });

    return isValid;
  };
}
