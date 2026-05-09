<template>
  <div class="article-list">
    <article
      v-for="article in articles"
      :key="article.id"
      class="article panel"
      :class="{ own: isOwn(article), draft: !article.published }"
    >
      <div class="article-header">
        <div>
          <router-link class="article-title" :to="{ name: 'article', params: { id: article.id } }">
            {{ article.title }}
          </router-link>
          <p v-if="article.createdBy" class="article-author">{{ article.createdBy.email }}</p>
        </div>

        <div class="article-actions">
          <router-link
            v-if="ability.can('update', article)"
            class="button-link button-secondary"
            :to="{ name: 'editArticle', params: { id: article.id } }"
            name="edit"
          >
            Edit
          </router-link>
          <button
            v-if="ability.can('delete', article)"
            class="button-link button-danger"
            type="button"
            name="delete"
            @click="destroy(article)"
          >
            Delete
          </button>
        </div>
      </div>

      <p class="article-body">{{ shorten(article.body) }}</p>
      <div class="article-meta">
        <span v-if="isOwn(article)" class="badge">Your article</span>
        <span v-if="!article.published" class="badge badge-muted">Draft</span>
      </div>
    </article>
  </div>
</template>

<script setup>
import { getCurrentInstance, onMounted, ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useAbility } from '@casl/vue';

const store = useStore();
const ability = useAbility();
const instance = getCurrentInstance();
const articles = ref([]);
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
    .catch((error) => store.dispatch('notifications/error', error.message));
});
</script>

<style scoped>
.article-list {
  display: grid;
  gap: 1rem;
}

.article {
  padding: 1.35rem;
}

.article.draft {
  border-color: rgba(212, 137, 70, 0.35);
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.article-title {
  font-size: 1.3rem;
  font-weight: 800;
  text-decoration: none;
}

.article-author {
  margin: 0.45rem 0 0;
  color: #61728f;
  font-size: 0.95rem;
}

.article-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.article-body {
  margin: 1rem 0 0;
  color: #364154;
  line-height: 1.7;
  white-space: pre-line;
}

.article-meta {
  display: flex;
  gap: 0.6rem;
  margin-top: 1rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  background: #e4eefc;
  color: #204d97;
  font-size: 0.84rem;
  font-weight: 700;
}

.badge-muted {
  background: #fff0dc;
  color: #936126;
}

@media (max-width: 700px) {
  .article-header {
    flex-direction: column;
  }
}
</style>
