import React from 'react';
import { useHistory } from 'react-router-dom';
import ArticleForm from './ArticleForm';
import { useAppTitle } from '../hooks/useAppTitle';

export default () => {
  const history = useHistory();
  useAppTitle('New Article');

  return (
    <ArticleForm onUpdate={() => history.push('/')} />
  );
};
