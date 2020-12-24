import React from 'react';
import {
  Container,
  Paper,
  makeStyles,
  createStyles,
  TextField,
  Checkbox,
  Button,
} from '@material-ui/core';
import TaskErrorNotification from './TaskErrorNotification';
import { useFormField, formToObject, minLength, required, validation } from '../hooks/useFormField';
import { useHistory } from 'react-router-dom';
import { useAsyncTask } from '../hooks/useAsyncTask';
import { useAppStore } from '../hooks/useAppStore';
import { useAppAbility } from '../hooks/useAppAbility';
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
  const published = useFormField(article?.published || false);

  return { title, body, published };
}

const validate = validation<ReturnType<typeof useArticleForm>>({
  title: [required],
  body: [required, minLength(5)]
});

type Props = {
  article?: Article
  onUpdate?(article: Article): void
}

export default ({ article, onUpdate }: Props) => {
  const styles = useStyles();
  const form = useArticleForm(article);
  const store = useAppStore();
  const history = useHistory();
  const { can } = useAppAbility();
  const saveTask = useAsyncTask(() => {
    const changes = {
      ...formToObject(form),
      id: article?.id,
    };

    if (article?.published) {
      delete changes.published;
    }

    return store.saveArticle(changes).then(onUpdate);
  }, () => validate(form));

  return (
    <Container>
      <Paper elevation={3}>
        <form className={styles.form} noValidate autoComplete="off" onSubmit={saveTask.exec}>
          <TaskErrorNotification task={saveTask} />
          <div className={styles.formField}>
            <TextField
              id="title"
              name="title"
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
              name="content"
              label="Content"
              required
              value={form.body.value}
              onChange={form.body.setValueFromEvent}
              error={!!form.body.error}
              helperText={form.body.error}
              fullWidth
            />
          </div>
          <div className={`${styles.formField} checkbox`} {...{ name: "published" }}>
            {(!article || can('publish', article)) && (
              <label>
                <Checkbox
                  checked={form.published.value}
                  onChange={form.published.setValueFromEvent}
                /> Publish
              </label>
            )}
          </div>
          <div className={styles.actions}>
            <Button onClick={() => history.push('/')}>Back</Button>
            <Button
              name="save"
              type="submit"
              variant="contained"
              color="primary"
              disabled={saveTask.isExecuting}
            >
              {article ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Paper>
    </Container>
  );
};
