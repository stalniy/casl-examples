<template>
  <v-layout column>
    <ArticleList />
  </v-layout>
</template>

<script>
  import ArticleList from '../components/ArticleList'

  export default {
    components: {
      ArticleList
    },
    created() {
      this.$store.dispatch('setTitle', 'List of Articles')
    }
  }
</script>
