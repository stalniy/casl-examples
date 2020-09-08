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

export default () => {
  const [articles, setArticles] = useAppStoreEffect(s => s.findArticles());
  const classes = useStyles();
  const { can } = useAppAbility();
  const history = useHistory();
  const store = useAppStore();
  const [indexToDelete, setIndexToDelete] = useState(-1);

  if (!articles) {
    return null;
  }

  const deleteArticle = () => {
    store.deleteArticle(articles[indexToDelete!])
      .then(() => {
        const copy = articles.slice(0);
        copy.splice(indexToDelete!, 1);
        setArticles(copy);
        setIndexToDelete(-1);
      });
  };

  return (
    <>
      <ConfirmDialog
        open={indexToDelete !== -1}
        onClose={() => setIndexToDelete(-1)}
        onConfirm={deleteArticle}
        content={`Are you sure you want to delete "${articles[indexToDelete]?.title}"`}
      />
      {articles.map((article, index) => (
        <Box key={article.id} mt={2}>
          <Card>
            <CardHeader
              avatar={
                <Avatar aria-label="recipe" className={classes.avatar}>
                  {article.createdBy.email[0].toUpperCase()}
                </Avatar>
              }
              title={article.title}
              subheader={formatDate(article.createdAt)}
            />
            <CardContent>
              <Typography variant="body2" color="textSecondary" component="p">
                {short(article.body)}
              </Typography>
            </CardContent>
            <CardActions disableSpacing>
              {can('update', article) && (
                <IconButton onClick={() => history.push(`/articles/${article.id}/edit`)}>
                  <EditIcon />
                </IconButton>
              )}
              {can('delete', article) && (
                <IconButton aria-label="delete" onClick={() => setIndexToDelete(index)}>
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
