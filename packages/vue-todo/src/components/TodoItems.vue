<template>
  <section class="main">
    <ul class="todo-list">
      <li v-for="(todo, index) in items" :key="todo.id" :class="classesFor(todo)">
        <input
          v-if="$can('update', todo)"
          type="checkbox"
          class="toggle"
          :checked="todo.completed"
          @input="updateTodoAt(index, { completed: $event.target.checked })"
        >
        <div class="view">
          <label @dblclick="editTodo(todo)">{{ todo.title }}</label>
        </div>
        <input class="edit"
          v-if="$can('update', todo)"
          v-model.trim="editedTitle"
          @blur="doneEditAt(index)"
          @keyup.enter="doneEditAt(index)"
          @keyup.esc="resetEdit"
        >
        <button
          v-if="$can('delete', todo)"
          @click="$emit('remove', todo)"
          class="destroy"
        ></button>
      </li>
    </ul>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { Todo, TodoInput } from '../models/Todo';

type State = {
  editedTitle: string,
  editedTodo: Todo | null
};

export interface UpdateEvent {
  index: number
  patch: Partial<TodoInput>
}

export default Vue.extend({
  name: 'TodoItems',
  props: {
    items: {
      type: Array as () => Todo[],
      required: true,
    }
  },
  data: (): State => ({
    editedTitle: '',
    editedTodo: null
  }),
  methods: {
    classesFor(todo: Todo) {
      return {
        todo: true,
        completed: todo.completed,
        editing: todo === this.editedTodo
      };
    },
    editTodo(todo: Todo) {
      if (!this.$can('update', todo)) {
        return;
      }

      this.editedTitle = todo.title;
      this.editedTodo = todo;
    },
    updateTodoAt(index: UpdateEvent['index'], patch: UpdateEvent['patch']) {
      this.$emit('update', {
        index,
        patch,
      });
    },
    doneEditAt(index: number) {
      if (!this.editedTodo) {
        return
      }

      const newTitle = this.editedTitle.trim();

      if (this.editedTitle) {
        this.updateTodoAt(index, { title: this.editedTitle });
      } else {
        this.$emit('remove', this.items[index]);
      }

      this.resetEdit();
    },
    resetEdit() {
      this.editedTodo = null;
      this.editedTitle = '';
    },
  }
});
</script>
