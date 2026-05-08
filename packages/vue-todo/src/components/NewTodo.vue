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

<script setup lang="ts">
import { reactive } from 'vue';
import type { TodoInput } from '../models/Todo';

const emit = defineEmits<{
  submit: [todo: TodoInput]
}>();

const newTodo = reactive<TodoInput>({
  title: '',
  assignee: '',
});

function submit() {
  if (!newTodo.title) {
    return;
  }

  emit('submit', { ...newTodo });
  newTodo.title = '';
  newTodo.assignee = '';
}
</script>
