<template>
  <div class="todoapp">
    <TodoList />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TodoList from './components/TodoList.vue';

export default Vue.extend({
  name: 'App',
  components: {
    TodoList
  },
});
</script>

<style src="./styles/app.css"></style>
