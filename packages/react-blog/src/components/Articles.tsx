import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  IconButton,
  Button,
  Avatar,
  Typography,
  Box,
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/EditOutlined';
import DeleteIcon from '@material-ui/icons/DeleteOutlined';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStoreEffect, useAppStore } from '../hooks/useAppStore';
import { formatDate } from '../services/date';
import { useAppAbility } from '../hooks/useAppAbility';
import ConfirmDialog from './ConfirmDialog';
import { Article } from '../models/Article';
import { User } from '../models/User';

const short = (value: string) => {
  return value.length > 250 ? `${value.slice(0, 200)}...` : value;
};

function articleClasses(article: Article, user?: User) {
  let css = 'article';

  if (article.createdBy?.email === user?.email) {
    css += ' own';
  }

  if (!article.published) {
    css += ' draft';
  }

  return css;
}

export default () => {
  const [articles, setArticles] = useAppStoreEffect(s => s.findArticles());
  const { can } = useAppAbility();
  const navigate = useNavigate();
  const store = useAppStore();
  const [articleToDelete, setArticleToDelete] = useState<Article>();
  const deleteArticle = () => {
    store.deleteArticle(articleToDelete!)
      .then(() => {
        const newArticles = articles!.filter((article) => article !== articleToDelete);
        setArticles(newArticles);
        setArticleToDelete(undefined);
      });
  };

  if (!articles) {
    return <div className="articles-loading" role="status">Loading the journal…</div>;
  }

  return (
    <>
      <ConfirmDialog
        open={!!articleToDelete}
        onClose={() => setArticleToDelete(undefined)}
        onConfirm={deleteArticle}
        content={`Are you sure you want to delete "${articleToDelete?.title}"`}
      />
      {articles.length === 0 && <div className="empty-journal"><h3>A new chapter starts here.</h3><p>There are no articles to read yet. Check back soon for ideas on CASL and authorization.</p></div>}
      <div className="article-grid">
        {articles.map((article, index) => (
          <Box key={article.id} className={articleClasses(article, store.user)}>
            <Card elevation={0}>
              <div className={`article-art article-art-${index % 3}`} aria-hidden="true"><span className="art-orbit" /><span className="art-glyph">{['{ }', '✓', '✳'][index % 3]}</span><span className="art-label">CASL / FIELD NOTES</span><span className="art-number">{String(index + 1).padStart(2, '0')}</span></div>
              <div className="article-category">AUTHORIZATION <span>{article.published ? 'JOURNAL' : 'DRAFT'}</span></div>
              <CardHeader
                avatar={
                  <Avatar className="author-avatar">
                    {article.createdBy?.email[0]?.toUpperCase()}
                  </Avatar>
                }
                title={<h3><Link to={`/articles/${article.id}`}>{article.title}</Link></h3>}
                subheader={`${article.createdBy?.email || 'CASL contributor'} · ${formatDate(article.createdAt)}`}
              />
              <CardContent>
                <Typography variant="body2" color="textSecondary" component="p">
                  {short(article.body)}
                </Typography>
              </CardContent>
              <CardActions disableSpacing>
                {can('update', article) && (
                  <IconButton onClick={() => navigate(`/articles/${article.id}/edit`)} name="edit" aria-label={`Edit ${article.title}`}>
                    <EditIcon />
                  </IconButton>
                )}
                {can('delete', article) && (
                  <IconButton aria-label="delete" onClick={() => setArticleToDelete(article)} name="delete">
                    <DeleteIcon />
                  </IconButton>
                )}
                <Button
                  size="small"
                  color="primary"
                  onClick={() => navigate(`/articles/${article.id}`)}
                >
                  Read article <span aria-hidden="true">↗</span>
                </Button>
              </CardActions>
            </Card>
          </Box>
        ))}
      </div>
    </>
  );
};
