import React from 'react';
import {
  TextField,
  Button,
  Container,
  Box,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../hooks/useAppStore';
import { useFormField, validation, required, minLength, email } from '../hooks/useFormField';
import { useAsyncTask } from '../hooks/useAsyncTask';
import { BadCredentialsError } from '../services/AppStore';
import TaskErrorNotification from './TaskErrorNotification';
import { when } from '../services/error';
import { useAppTitle } from '../hooks/useAppTitle';

function useLoginForm() {
  const email = useFormField();
  const password = useFormField();

  return { email, password };
}

const validate = validation<ReturnType<typeof useLoginForm>>({
  email: [required, email],
  password: [minLength(6)]
});

export default () => {
  const store = useAppStore();
  const form = useLoginForm();
  const navigate = useNavigate();
  const loginTask = useAsyncTask((task) => {
    return store.login(form.email.value!, form.password.value!)
      .then(() => {
        navigate('/');
      })
      .catch(error => when(error, [
        [BadCredentialsError, () => task.setError('Invalid login or password')]
      ]))
  }, () => validate(form));
  useAppTitle('Login');

  return (
    <Container maxWidth="sm" className="login-page">
      <div className="page-intro"><span className="eyebrow">YOUR NEXT CHAPTER</span><h1>Welcome back.</h1><p>Sign in to share your perspective and see CASL permissions in action.</p></div>
      <Paper elevation={0} className="form-panel">
        <Box component="form" sx={{ mt: 5, p: 2 }} noValidate autoComplete="off" onSubmit={loginTask.exec}>
          <TaskErrorNotification task={loginTask} />
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              autoComplete="username"
              id="email"
              type="email"
              label="E-mail"
              value={form.email.value}
              onChange={form.email.setValueFromEvent}
              error={!!form.email.error}
              helperText={form.email.error}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              autoComplete="current-password"
              id="password"
              label="Password"
              type="password"
              value={form.password.value}
              onChange={form.password.setValueFromEvent}
              error={!!form.password.error}
              helperText={form.password.error}
            />
          </Box>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            name="login"
            disabled={loginTask.isExecuting}
          >
            Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};
