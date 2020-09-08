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

export default (props: Props) => {
  return (
    <Dialog open={props.open} onExited={props.onClose}>
      <DialogTitle>{props.title || 'Confirmation'}</DialogTitle>
      <DialogContent>
        <DialogContentText>{props.content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={props.onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={props.onConfirm} color="secondary">Confirm</Button>
      </DialogActions>
    </Dialog>
  );
};
