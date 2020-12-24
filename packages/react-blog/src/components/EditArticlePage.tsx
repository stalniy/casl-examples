import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import ArticleForm from './ArticleForm';
import { useAppStoreEffect } from '../hooks/useAppStore';
import { useAppTitle } from '../hooks/useAppTitle';
import { Article } from '../models/Article';

export default () => {
  const params = useParams<{ id: string }>();
  const [article, setArticle] = useAppStoreEffect<Article>((store) => {
    return store.findArticleById(params.id);
  }, [params]);
  const history = useHistory();

  useAppTitle(`Edit "${article?.title}"`);

  if (!article) {
    return null;
  }

  return <ArticleForm
    article={article}
    onUpdate={(article) => {
      setArticle(article);
      history.push('/');
    }}
  />
};
