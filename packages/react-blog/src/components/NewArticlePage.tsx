import React from 'react';
import { useNavigate } from 'react-router-dom';
import ArticleForm from './ArticleForm';
import { useAppTitle } from '../hooks/useAppTitle';

export default () => {
  const navigate = useNavigate();
  useAppTitle('New Article');

  return (
    <ArticleForm onUpdate={() => navigate('/')} />
  );
};
