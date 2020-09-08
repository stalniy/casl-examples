import React from 'react';
import { Container } from '@material-ui/core';
import Articles from './Articles';
import { useAppTitle } from '../hooks/useAppTitle';

export default () => {
  useAppTitle('Articles');

  return (
    <Container>
      <Articles />
    </Container>
  );
};
