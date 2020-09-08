import { useState, useEffect, useRef } from 'react';

export interface AsyncTask {
  error: string
  setError(value: string): void
  isExecuting: boolean
  setIsExecuting(value: boolean): void
}

type Run = (task: AsyncTask, ...args: any[]) => Promise<unknown>;
type Validate = () => boolean;

export function useAsyncTask(run: Run, validate?: Validate) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState('');
  const state = useRef({ isUnmounted: false });
  const exec = (event: any) => {
    if (event && event.preventDefault) {
      event.preventDefault();
    }

    setError('');

    if (isExecuting || validate && !validate()) { // eslint-disable-line no-mixed-operators
      return;
    }

    setIsExecuting(true);
    run(task, event)
      .catch((error) => {
        if (!error.response) {
          throw error;
        }

        const status = error.response.status;

        if (status >= 500) {
          task.setError('The service is temporary unavailable');
        } else if (status === 403) {
          task.setError('You are not allowed to perform this operation');
        } else if (error.response.status >= 400) {
          task.setError('Invalid form. Please check your form fields');
        }
      })
      .finally(() => !state.current?.isUnmounted && setIsExecuting(false));
  };
  const task = {
    error,
    setError,
    isExecuting,
    setIsExecuting,
    exec,
  };

  useEffect(() => () => { state.current.isUnmounted = true; }, []);

  return task;
}
