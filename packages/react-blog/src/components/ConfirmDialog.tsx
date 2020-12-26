import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@material-ui/core';

interface Props {
  open: boolean
  title?: string,
  content: string,
  onConfirm(): void
  onClose(): void
};

export default React.forwardRef<typeof Dialog, Props>((props, ref) => {
  return (
    <Dialog open={props.open} onExited={props.onClose} ref={ref}>
      <DialogTitle>{props.title || 'Confirmation'}</DialogTitle>
      <DialogContent>
        <DialogContentText>{props.content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={props.onClose} color="primary" name="reject">
          Cancel
        </Button>
        <Button onClick={props.onConfirm} color="secondary" name="confirm">Confirm</Button>
      </DialogActions>
    </Dialog>
  );
});
