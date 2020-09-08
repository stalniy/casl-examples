import React from 'react';
import { Container, Typography } from '@material-ui/core';
import { useParams } from 'react-router-dom';
import { Article } from '../models/Article';
import { useAppStoreEffect } from '../hooks/useAppStore';
import { useAppTitle } from '../hooks/useAppTitle';

interface Props {
  article: Article
}

export function ArticlePage({ article }: Props) {
  return (
    <Container>
      <Typography variant="body1">{article.body}</Typography>
    </Container>
  );
};

export default () => {
  const params = useParams<{ id: string }>();
  const [article] = useAppStoreEffect(store => store.findArticleById(params.id), [params]);
  useAppTitle(article?.title || 'Article');

  if (!article) {
    return null;
  }

  return <ArticlePage article={article} />
};
