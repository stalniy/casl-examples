<template>
  <div class="new-todo">
    <input
      name="title"
      autofocus
      autocomplete="off"
      placeholder="What needs to be done?"
      v-model.trim="newTodo.title"
      @keyup.enter="submit"
    >

    <select name="assignee" v-model="newTodo.assignee" @keyup.enter="submit">
      <option value="" disabled>Choose Assignee</option>
      <option>me</option>
      <option>John Doe</option>
      <option>Alex Pupkin</option>
    </select>
  </div>
</template>

<script lang="ts">
import Vue from '../AppVue';

export default Vue.extend({
  name: 'NewTodo',
  data: () => ({
    newTodo: {
      title: '',
      assignee: ''
    }
  }),
  methods: {
    submit() {
      if (!this.newTodo.title) {
        return;
      }

      this.$emit('submit', { ...this.newTodo });
      this.newTodo.title = '';
      this.newTodo.assignee = '';
    },
  },
});
</script>
