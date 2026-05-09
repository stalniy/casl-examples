<template>
  <section class="editor panel">
    <form class="editor-form" @submit.prevent="save">
      <div class="field">
        <label for="title">Title</label>
        <input id="title" v-model.trim="article.title" name="title" />
        <div v-if="errors.title.length" class="field-errors">
          <span v-for="error in errors.title" :key="error">{{ error }}</span>
        </div>
      </div>

      <div class="field">
        <label for="content">Content</label>
        <textarea id="content" v-model.trim="article.body" name="content" rows="12" />
        <div v-if="errors.body.length" class="field-errors">
          <span v-for="error in errors.body" :key="error">{{ error }}</span>
        </div>
      </div>

      <label v-if="canPublish" class="toggle">
        <input v-model="article.published" name="published" type="checkbox" />
        <span>Publish now</span>
      </label>

      <div class="editor-actions">
        <router-link class="button-link button-secondary" :to="{ name: 'home' }">
          Back to articles
        </router-link>
        <button class="button" type="submit" name="save">Save</button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useAbility } from '@casl/vue';
import { maxLength, required } from '../validation';

const store = useStore();
const route = useRoute();
const router = useRouter();
const ability = useAbility();

const originalArticle = ref(null);
const article = reactive({
  id: undefined,
  title: '',
  body: '',
  published: false,
});
const errors = reactive({
  title: [],
  body: [],
});

const canPublish = computed(() => (
  !originalArticle.value || ability.can('publish', originalArticle.value)
));

function validateField(value, validators) {
  return validators
    .map((validator) => validator(value))
    .filter((result) => result !== true);
}

function validate() {
  errors.title = validateField(article.title, [required, maxLength(250)]);
  errors.body = validateField(article.body, [required]);

  return !errors.title.length && !errors.body.length;
}

function save() {
  if (!validate()) {
    return;
  }

  const payload = {
    id: article.id,
    title: article.title,
    body: article.body,
  };

  if (canPublish.value) {
    payload.published = article.published;
  }

  return store.dispatch('articles/save', payload)
    .then(() => {
      return store.dispatch(
        'notifications/info',
        article.published
          ? 'Article has been successfully published'
          : 'Article has been successfully saved',
      );
    })
    .then(() => router.push('/'))
    .catch((error) => store.dispatch('notifications/error', error.message));
}

onMounted(() => {
  const id = route.params.id;

  if (id) {
    store.dispatch('setTitle', 'Edit Article');
    store.dispatch('articles/findById', id)
      .then((loadedArticle) => {
        originalArticle.value = loadedArticle;
        Object.assign(article, loadedArticle);
        store.dispatch('setTitle', `Edit "${loadedArticle.title}"`);
      })
      .catch((error) => store.dispatch('notifications/error', error.message));
  } else {
    store.dispatch('setTitle', 'New Article');
  }
});
</script>

<style scoped>
.editor {
  padding: 1.5rem;
}

.editor-form {
  display: grid;
  gap: 1.15rem;
}

.toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: #33415b;
}

.toggle input {
  width: 1.1rem;
  height: 1.1rem;
}

.editor-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
</style>
