import React from 'react';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';

export default function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
