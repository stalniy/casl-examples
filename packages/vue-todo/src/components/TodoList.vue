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

<script lang="ts">
import Vue from 'vue';
import TodoItems, { UpdateEvent } from './TodoItems.vue';
import TodoFooter from './TodoFooter.vue';
import NewTodo from './NewTodo.vue';
import { Todo } from '../models/Todo';
import storage from '../services/todo-storage';

interface State {
  todos: Todo[]
}

export default Vue.extend({
  name: 'TodoList',
  components: {
    TodoItems,
    TodoFooter,
    NewTodo,
  },
  data: (): State => ({
    todos: [],
  }),
  watch: {
    todos: {
      deep: true,
      handler: todos => storage.save(todos)
    }
  },
  created() {
    this.todos = storage.fetch();
  },
  methods: {
    addTodo(todo: Todo) {
      this.todos.push(storage.build(todo))
    },
    updateTodo({ index, patch }: UpdateEvent) {
      Object.assign(this.todos[index], patch);
    },
    removeTodo(todo: Todo) {
      this.todos.splice(this.todos.indexOf(todo), 1)
    },
  },
});
</script>
