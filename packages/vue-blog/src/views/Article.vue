<template>
  <article class="article-view panel">
    <p class="article-label">Article</p>
    <h2>{{ article.title }}</h2>
    <p class="article-content">{{ article.body }}</p>
  </article>
</template>

<script setup>
import { onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

const store = useStore();
const route = useRoute();

const article = reactive({
  title: '',
  body: '',
});

onMounted(() => {
  const id = route.params.id;

  if (!id) {
    return;
  }

  store.dispatch('setTitle', 'View Article');
  store.dispatch('articles/findById', id)
    .then((loadedArticle) => {
      Object.assign(article, loadedArticle);
      store.dispatch('setTitle', loadedArticle.title);
    })
    .catch((error) => store.dispatch('notifications/error', error.message));
});
</script>

<style scoped>
.article-view {
  padding: 1.75rem;
}

.article-label {
  margin: 0 0 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.8rem;
  font-weight: 800;
  color: #6a7a95;
}

h2 {
  margin: 0 0 1rem;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
}

.article-content {
  margin: 0;
  color: #364154;
  line-height: 1.8;
  white-space: pre-line;
}
</style>
