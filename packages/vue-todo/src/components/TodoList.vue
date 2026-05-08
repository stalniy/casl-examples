<template>
  <div>
    <header class="header">
      <h1>Todos</h1>
      <Can I="create" a="Todo">
        <NewTodo @submit="addTodo" />
      </Can>
    </header>
    <TodoItems
      :items="todos"
      @update="updateTodo"
      @remove="removeTodo"
    />
    <TodoFooter :items="todos" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import TodoItems, { type UpdateEvent } from './TodoItems.vue';
import TodoFooter from './TodoFooter.vue';
import NewTodo from './NewTodo.vue';
import type { Todo, TodoInput } from '../models/Todo';
import storage from '../services/todo-storage';

const todos = ref<Todo[]>(storage.fetch());

watch(
  todos,
  (nextTodos) => {
    storage.save(nextTodos);
  },
  { deep: true },
);

function addTodo(todo: TodoInput) {
  todos.value.push(storage.build(todo));
}

function updateTodo({ index, patch }: UpdateEvent) {
  Object.assign(todos.value[index], patch);
}

function removeTodo(todo: Todo) {
  todos.value.splice(todos.value.indexOf(todo), 1);
}
</script>
