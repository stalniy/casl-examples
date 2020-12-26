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
  createStyles,
  makeStyles,
  Box,
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/EditOutlined';
import DeleteIcon from '@material-ui/icons/DeleteOutlined';
import { red } from '@material-ui/core/colors';
import { useHistory } from 'react-router-dom';
import { useAppStoreEffect, useAppStore } from '../hooks/useAppStore';
import { formatDate } from '../services/date';
import { useAppAbility } from '../hooks/useAppAbility';
import ConfirmDialog from './ConfirmDialog';
import { Article } from '../models/Article';
import { User } from '../models/User';

const useStyles = makeStyles(theme => createStyles({
  root: {
    maxWidth: 345,
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  avatar: {
    backgroundColor: red[500],
  },
}));

const short = (value: string) => {
  return value.length > 250 ? `${value.slice(0, 200)}...` : value;
};

function articleClasses(article: Article, user?: User) {
  let css = 'article';

  if (article.createdBy.email === user?.email) {
    css += ' own';
  }

  if (!article.published) {
    css += ' draft';
  }

  return css;
}

export default () => {
  const [articles, setArticles] = useAppStoreEffect(s => s.findArticles());
  const classes = useStyles();
  const { can } = useAppAbility();
  const history = useHistory();
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
    return null;
  }

  return (
    <>
      <ConfirmDialog
        open={!!articleToDelete}
        onClose={() => setArticleToDelete(undefined)}
        onConfirm={deleteArticle}
        content={`Are you sure you want to delete "${articleToDelete?.title}"`}
      />
      {articles.map((article, index) => (
        <Box key={article.id} mt={2} className={articleClasses(article, store.user)}>
          <Card>
            <CardHeader
              avatar={
                <Avatar aria-label="recipe" className={classes.avatar}>
                  {article.createdBy.email[0].toUpperCase()}
                </Avatar>
              }
              title={<h3>{article.title}</h3>}
              subheader={formatDate(article.createdAt)}
            />
            <CardContent>
              <Typography variant="body2" color="textSecondary" component="p">
                {short(article.body)}
              </Typography>
            </CardContent>
            <CardActions disableSpacing>
              {can('update', article) && (
                <IconButton onClick={() => history.push(`/articles/${article.id}/edit`)} name="edit">
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
                onClick={() => history.push(`/articles/${article.id}`)}
              >
                Learn More
              </Button>
            </CardActions>
          </Card>
        </Box>
      ))}
    </>
  );
};
