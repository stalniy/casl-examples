import React from 'react';
import { Container, Typography } from '@material-ui/core';
import { Link, useParams } from 'react-router-dom';
import { formatDate } from '../services/date';
import { Article } from '../models/Article';
import { useAppStoreEffect } from '../hooks/useAppStore';
import { useAppTitle } from '../hooks/useAppTitle';

interface Props {
  article: Article
}

export function ArticlePage({ article }: Props) {
  return (
    <Container maxWidth="md" className="reading-page">
      <Link to="/" className="text-link">← Back to the journal</Link>
      <article>
        <header className="reading-header"><span className="eyebrow">AUTHORIZATION / {article.published ? 'JOURNAL' : 'DRAFT'}</span><h1>{article.title}</h1><p>{article.createdBy?.email || 'CASL contributor'} <span aria-hidden="true">·</span> {formatDate(article.createdAt)}</p></header>
        <Typography variant="body1" className="article-body">{article.body}</Typography>
      </article>
      <aside className="reading-note">Thoughtful permissions start with expressive rules. <a href="https://casl.js.org/">Build with CASL ↗</a></aside>
    </Container>
  );
};

export default () => {
  const params = useParams<{ id: string }>();
  const [article] = useAppStoreEffect(store => store.findArticleById(params.id!), [params]);
  useAppTitle(article?.title || 'Article');

  if (!article) {
    return null;
  }

  return <ArticlePage article={article} />
};
