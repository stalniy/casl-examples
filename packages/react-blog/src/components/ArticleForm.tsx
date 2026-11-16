import React from 'react';
import {
  Container,
  Box,
  Paper,
  TextField,
  Checkbox,
  Button,
} from '@mui/material';
import TaskErrorNotification from './TaskErrorNotification';
import { useFormField, formToObject, minLength, required, validation } from '../hooks/useFormField';
import { useNavigate } from 'react-router-dom';
import { useAsyncTask } from '../hooks/useAsyncTask';
import { useAppStore } from '../hooks/useAppStore';
import { useAppAbility } from '../hooks/useAppAbility';
import { Article } from '../models/Article';

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
  const form = useArticleForm(article);
  const store = useAppStore();
  const navigate = useNavigate();
  const { can } = useAppAbility();
  const saveTask = useAsyncTask(() => {
    const changes = {
      ...formToObject(form),
      id: article?.id,
    };

    if (article?.published) {
      delete (changes as Record<string, any>).published;
    }

    return store.saveArticle(changes).then(onUpdate);
  }, () => validate(form));

  return (
    <Container maxWidth="md" className="editor-page">
      <div className="page-intro"><span className="eyebrow">THE AUTHOR’S DESK</span><h1>{article ? 'Refine your perspective.' : 'Share what you know.'}</h1><p>A practical idea today could be someone’s breakthrough tomorrow.</p></div>
      <Paper elevation={0} className="form-panel">
        <Box component="form" sx={{ mt: 5, p: 2 }} noValidate autoComplete="off" onSubmit={saveTask.exec}>
          <TaskErrorNotification task={saveTask} />
          <Box sx={{ mb: 2 }}>
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
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              multiline
              minRows={12}
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
          </Box>
          <Box sx={{ mb: 2 }} className="checkbox" {...{ name: "published" }}>
            {(!article || can('publish', article)) && (
              <label>
                <Checkbox
                  checked={form.published.value}
                  onChange={form.published.setValueFromEvent}
                /> Publish
              </label>
            )}
          </Box>
          <Box sx={{ '& > *': { mr: 2 } }}>
            <Button onClick={() => navigate('/')}>Back</Button>
            <Button
              name="save"
              type="submit"
              variant="contained"
              color="primary"
              disabled={saveTask.isExecuting}
            >
              {article ? 'Update' : 'Create'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};
