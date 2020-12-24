<template>
  <v-layout column>
    <form @submit.prevent="save">
      <v-text-field
        name="title"
        label="Title"
        v-model="article.title"
        single-line
        :rules="titleValidation"
      />
      <v-textarea
        name="content"
        label="Content"
        v-model="article.body"
        :rules="bodyValidation"
      />
      <v-checkbox
        name="published"
        label="Publish"
        v-model="article.published"
        v-if="canPublish"
        class="checkbox"
      />

      <v-btn :to="{ name: 'home' }" small>Back to articles</v-btn>
      <v-btn color="success" small type="submit" name="save">Save</v-btn>
    </form>
  </v-layout>
</template>

<script>
  import { mapActions } from 'vuex'
  import { required, maxLength } from '../validation'

  export default {
    data() {
      return {
        originalArticle: null,
        article: {
          title: '',
          body: '',
          published: false,
        },
        titleValidation: [
          required,
          maxLength(250)
        ],
        bodyValidation: [
          required
        ]
      }
    },
    computed: {
      canPublish() {
        return !this.originalArticle || this.$can('publish', this.originalArticle)
      }
    },
    methods: {
      ...mapActions('articles', {
        saveArticle: 'save',
        getArticle: 'findById',
        publishArticle: 'publish',
      }),
      ...mapActions('notifications', ['info']),

      save() {
        const { published, ...article } = this.article;

        if (this.canPublish) {
          article.published = published;
        }

        return this.saveArticle(article)
          .then(() => {
            if (this.article.published) {
              this.info('Article has been successfully published')
            } else {
              this.info('Article has been successfully saved')
            }

            this.$router.push('/')
          })
      },
    },
    created() {
      const id = this.$route.params.id

      if (id) {
        this.$store.dispatch('setTitle', 'Edit Article')
        this.getArticle(id)
          .then((article) => {
            this.originalArticle = article
            this.article = { ...article }
            this.$store.dispatch('setTitle', `Edit "${article.title}"`)
          })
      } else {
        this.$store.dispatch('setTitle', 'New Article')
      }
    }
  }
</script>
