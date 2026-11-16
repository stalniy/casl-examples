import React from 'react';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

export default React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert ref={ref} elevation={6} variant="filled" {...props} />;
});
