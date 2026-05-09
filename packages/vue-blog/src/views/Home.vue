<template>
  <section>
    <ArticleList />
  </section>
</template>

<script setup>
import { onMounted } from 'vue';
import { useStore } from 'vuex';
import ArticleList from '../components/ArticleList.vue';

const store = useStore();

onMounted(() => {
  store.dispatch('setTitle', 'List of Articles');
});
</script>
