import React from 'react';
import { Snackbar } from '@material-ui/core';
import Alert from './Alert';
import { AsyncTask } from '../hooks/useAsyncTask'

interface Props {
  task: AsyncTask
}

export default ({ task }: Props) => {
  const discardError = () => task.setError('');

  if (!task.error) {
    return null;
  }

  return (
    <Snackbar open={!!task.error} autoHideDuration={6000} onClose={discardError}>
      <Alert onClose={discardError} severity="error">
        {task.error}
      </Alert>
    </Snackbar>
  )
};
