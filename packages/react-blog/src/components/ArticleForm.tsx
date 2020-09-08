import React from 'react';
import {
  Container,
  Paper,
  makeStyles,
  createStyles,
  TextField,
  Button,
} from '@material-ui/core';
import TaskErrorNotification from './TaskErrorNotification';
import { useFormField, formToObject, minLength, required, validation } from '../hooks/useFormField';
import { useHistory } from 'react-router-dom';
import { useAsyncTask } from '../hooks/useAsyncTask';
import { useAppStore } from '../hooks/useAppStore';
import { Article } from '../models/Article';

const useStyles = makeStyles(theme => createStyles({
  formField: {
    marginBottom: theme.spacing(2),
  },
  form: {
    marginTop: theme.spacing(5),
    padding: theme.spacing(2),
  },
  actions: {
    '& > *': {
      marginRight: theme.spacing(2)
    }
  }
}));

function useArticleForm(article?: Article) {
  const title = useFormField(article?.title);
  const body = useFormField(article?.body);

  return { title, body };
}

const validate = validation<ReturnType<typeof useArticleForm>>({
  title: [required],
  body: [required, minLength(10)]
});

function PublishButton(props: { article: Article, onPublished?(article: Article): void }) {
  const store = useAppStore();
  const publishTask = useAsyncTask(() => {
    return store.saveArticle({ id: props.article.id, published: true })
      .then(props.onPublished);
  });

  return (
    <>
      <TaskErrorNotification task={publishTask} />
      <Button
        variant="contained"
        color="secondary"
        disabled={publishTask.isExecuting}
        onClick={publishTask.exec}
      >
        Publish
      </Button>
    </>
  );
}

type Props = {
  article?: Article
  onUpdate?(article: Article): void
}

export default ({ article, onUpdate }: Props) => {
  const styles = useStyles();
  const form = useArticleForm(article);
  const store = useAppStore();
  const history = useHistory();
  const saveTask = useAsyncTask(() => {
    return store.saveArticle(formToObject(form)).then(onUpdate);
  }, () => validate(form));

  return (
    <Container>
      <Paper elevation={3}>
        <form className={styles.form} noValidate autoComplete="off" onSubmit={saveTask.exec}>
          <TaskErrorNotification task={saveTask} />
          <div className={styles.formField}>
            <TextField
              id="title"
              label="Title"
              required
              value={form.title.value}
              onChange={form.title.setValueFromEvent}
              error={!!form.title.error}
              helperText={form.title.error}
              fullWidth
            />
          </div>
          <div className={styles.formField}>
            <TextField
              multiline
              rows="20"
              id="body"
              label="Content"
              required
              value={form.body.value}
              onChange={form.body.setValueFromEvent}
              error={!!form.body.error}
              helperText={form.body.error}
              fullWidth
            />
          </div>
          <div className={styles.actions}>
            <Button onClick={() => history.push('/')}>Back</Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={saveTask.isExecuting}
            >
              {article ? 'Update' : 'Create'}
            </Button>
            {article && !article.published && (
              <PublishButton article={article} onPublished={onUpdate} />
            )}
          </div>
        </form>
      </Paper>
    </Container>
  );
};
