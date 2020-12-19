<template>
  <div>
    <v-card v-for="article in articles" :key="article.id" class="article" :class="{ own: isOwn(article), draft: !article.published }">
      <v-card-title class="article-title">
        <router-link :to="{ name: 'article', params: article }" tag="h3" class="headline mb-0">{{ article.title }}</router-link>
        <div v-if="article.createdBy">{{ article.createdBy.email }}</div>
      </v-card-title>
      <v-card-text>{{ article.body | short }}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn icon :to="{ name: 'editArticle', params: article }" v-if="$can('update', article)" name="edit">
          <v-icon>edit</v-icon>
        </v-btn>
        <v-btn icon @click="destroy(article)" v-if="$can('delete', article)" name="delete">
          <v-icon>delete</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
  import { mapActions, mapState } from 'vuex'

  export default {
    data() {
      return {
        articles: []
      }
    },
    computed: {
      ...mapState({
        currentUser: store => store.email
      }),
    },
    methods: {
      ...mapActions('articles', {
        getArticles: 'find',
        deleteArticle: 'destroy'
      }),
      ...mapActions('notifications', ['error']),

      destroy(article) {
        this.$confirm(`Are you sure you want to delete "${article.title}"`, 'Delete Article', { color: 'error', yesLabel: 'Delete' })
          .then(canDelete => canDelete ? this.deleteArticle(article) : null)
          .then(isDestroyed => isDestroyed && this.remove(article))
      },

      remove(article) {
        const index = this.articles.indexOf(article)
        this.articles.splice(index, 1)
      },

      isOwn(article) {
        return article.createdBy.email === this.currentUser;
      }
    },
    created() {
      this.getArticles()
        .then(articles => this.articles = articles)
        .catch(error => this.error(error.message))
    },
    filters: {
      short(rawValue) {
        const value = rawValue || ''

        if (value > 250) {
          return `${value.slice(0, 200)}...`
        }

        return value
      }
    }
  }
</script>

<style scoped lang="scss">
  .article {
    margin-bottom: 20px;
  }

  .headline {
    cursor: pointer;
  }

  .article-title {
    display: block;
  }
</style>
