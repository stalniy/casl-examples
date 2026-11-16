<template>
  <form class="new-todo" @submit.prevent="submit">
    <span class="add-symbol" aria-hidden="true">＋</span>
    <input
      name="title"
      aria-label="Task title"
      autocomplete="off"
      placeholder="What's your next authorization task?"
      v-model.trim="newTodo.title"
    >
    <select name="assignee" aria-label="Assign task to" v-model="newTodo.assignee">
      <option value="" disabled>Assign to</option>
      <option>me</option>
      <option>John Doe</option>
      <option>Alex Pupkin</option>
    </select>
    <button class="add-button" type="submit" :disabled="!newTodo.title || !newTodo.assignee">Add task <span aria-hidden="true">↵</span></button>
  </form>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import type { TodoInput } from '../models/Todo';

const emit = defineEmits<{
  submit: [todo: TodoInput]
}>();

const newTodo = reactive<TodoInput>({ title: '', assignee: 'me' });

function submit() {
  if (!newTodo.title || !newTodo.assignee) return;
  emit('submit', { ...newTodo });
  newTodo.title = '';
}
</script>
