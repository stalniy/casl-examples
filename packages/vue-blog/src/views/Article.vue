<template>
  <section class="reading-page">
    <router-link to="/" class="text-link">← Back to the journal</router-link>
    <article v-if="article.title">
      <header class="reading-header"><span class="eyebrow">AUTHORIZATION / {{ article.published ? 'JOURNAL' : 'DRAFT' }}</span><h1>{{ article.title }}</h1><p>{{ article.createdBy?.email || 'CASL contributor' }}<template v-if="article.createdAt"> · {{ formatDate(article.createdAt) }}</template></p></header>
      <p class="article-body">{{ article.body }}</p>
    </article>
    <aside class="reading-note">Thoughtful permissions start with expressive rules. <a href="https://casl.js.org/">Build with CASL ↗</a></aside>
  </section>
</template>

<script setup>
import { onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { formatDate } from '../services/date';

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
