<template>
  <div v-if="loading" class="articles-loading" role="status">Loading the journal…</div>
  <div v-else-if="loadFailed" class="empty-journal" role="alert"><h3>The journal couldn’t load.</h3><p>Please refresh to try again.</p></div>
  <div v-else-if="!articles.length" class="empty-journal"><h3>A new chapter starts here.</h3><p>There are no articles to read yet. Check back soon for ideas on CASL and authorization.</p></div>
  <div v-else class="article-grid">
    <article v-for="(article, index) in articles" :key="article.id" class="article" :class="{ own: isOwn(article), draft: !article.published }">
      <div class="article-card">
        <div class="article-art" :class="`article-art-${index % 3}`" aria-hidden="true"><span class="art-orbit" /><span class="art-glyph">{{ ['{ }', '✓', '✳'][index % 3] }}</span><span class="art-label">CASL / FIELD NOTES</span><span class="art-number">{{ String(index + 1).padStart(2, '0') }}</span></div>
        <div class="article-category">AUTHORIZATION <span>{{ article.published ? 'JOURNAL' : 'DRAFT' }}</span></div>
        <header class="article-header">
          <span class="author-avatar" aria-hidden="true">{{ (article.createdBy?.email || 'C')[0].toUpperCase() }}</span>
          <div class="article-heading">
            <h3><router-link class="article-title" :to="{ name: 'article', params: { id: article.id } }">{{ article.title }}</router-link></h3>
            <p class="article-byline">{{ article.createdBy?.email || 'CASL contributor' }}<template v-if="article.createdAt"> · {{ formatDate(article.createdAt) }}</template></p>
          </div>
        </header>
        <div class="article-excerpt"><p>{{ shorten(article.body) }}</p></div>
        <div class="article-actions">
          <router-link v-if="ability.can('update', article)" class="icon-button" :to="{ name: 'editArticle', params: { id: article.id } }" name="edit" :aria-label="`Edit ${article.title}`"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m16 3 5 5-12 12H4v-5L16 3Zm-2 3 5 5M4 20l5-1" /></svg></router-link>
          <button v-if="ability.can('delete', article)" class="icon-button" type="button" name="delete" :aria-label="`Delete ${article.title}`" @click="destroy(article)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7" /></svg></button>
          <router-link class="read-link" :to="{ name: 'article', params: { id: article.id } }">Read article <span aria-hidden="true">↗</span></router-link>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup>
import { getCurrentInstance, onMounted, ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useAbility } from '@casl/vue';
import { formatDate } from '../services/date';

const store = useStore();
const ability = useAbility();
const instance = getCurrentInstance();
const articles = ref([]);
const loading = ref(true);
const loadFailed = ref(false);
const userId = computed(() => store.state.userId);

async function destroy(article) {
  const canDelete = await instance.proxy.$confirm(
    `Are you sure you want to delete "${article.title}"?`,
    'Delete Article',
    { color: 'error', yesLabel: 'Delete' },
  );

  if (!canDelete) {
    return;
  }

  await store.dispatch('articles/destroy', article);
  remove(article);
}

function remove(article) {
  const index = articles.value.indexOf(article);
  articles.value.splice(index, 1);
}

function isOwn(article) {
  return article.author === userId.value;
}

function shorten(value = '') {
  if (value.length > 250) {
    return `${value.slice(0, 200)}...`;
  }

  return value;
}

onMounted(() => {
  store.dispatch('articles/find')
    .then((items) => {
      articles.value = items;
    })
    .catch((error) => {
      loadFailed.value = true;
      store.dispatch('notifications/error', error.message);
    })
    .finally(() => { loading.value = false; });
});
</script>
