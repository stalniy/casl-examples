<template>
  <v-layout column>
    <form @submit.prevent="save">
      <v-text-field label="Title" v-model="article.title" single-line :rules="titleValidation"></v-text-field>
      <v-text-field label="Content" v-model="article.body" multi-line :rules="bodyValidation"></v-text-field>

      <v-btn :to="{ name: 'home' }" small>Back to articles</v-btn>
      <v-btn color="success" small type="submit">Save</v-btn>
      <v-btn color="success" small @click="publish" v-if="$can('publish', article)">Publish</v-btn>
    </form>
  </v-layout>
</template>

<script>
  import { mapActions } from 'vuex'
  import { required, maxLength } from '../validation'

  export default {
    data() {
      return {
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
    methods: {
      ...mapActions('articles', {
        saveArticle: 'save',
        getArticle: 'findById',
        publishArticle: 'publish',
      }),
      ...mapActions('notifications', ['info']),

      save() {
        return this.saveArticle(this.article)
          .then(() => {
            this.info('Article has been successfully saved')
            this.$router.push('/')
          })
      },

      publish() {
        return this.publishArticle(this.article)
          .then(() => {
            this.info('Article has been successfully published')
            this.$router.push('/')
          })
      }
    },
    created() {
      const id = this.$route.params.id

      if (id) {
        this.$store.dispatch('setTitle', 'Edit Article')
        this.getArticle(id)
          .then(article => {
            this.article = article
            this.$store.dispatch('setTitle', `Edit "${article.title}"`)
          })
      } else {
        this.$store.dispatch('setTitle', 'New Article')
      }
    }
  }
</script>
