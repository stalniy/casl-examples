<template>
  <v-layout>
    <div>{{ article.body }}</div>
  </v-layout>
</template>

<script>
  import { mapActions } from 'vuex'

  export default {
    data() {
      return {
        article: {
          title: '',
          body: ''
        }
      }
    },
    methods: {
      ...mapActions('articles', {
        getArticle: 'findById'
      })
    },
    created() {
      const id = this.$route.params.id

      if (id) {
        this.$store.dispatch('setTitle', 'View Article')
        this.getArticle(id)
          .then(article => {
            this.article = article
            this.$store.dispatch('setTitle', article.title)
          })
      }
    }
  }
</script>
