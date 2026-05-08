<template>
  <section class="main" v-if="items.length">
    <ul class="todo-list">
      <li v-for="(todo, index) in items" :key="todo.id" :class="classesFor(todo)">
        <input
          v-if="ability.can('update', todo)"
          type="checkbox"
          class="toggle"
          :checked="todo.completed"
          @input="updateTodoCompletion(index, $event)"
        >
        <div class="view">
          <label @dblclick="editTodo(todo)">{{ todo.title }}</label>
        </div>
        <input class="edit"
          v-if="ability.can('update', todo)"
          v-model.trim="editedTitle"
          @blur="doneEditAt(index)"
          @keyup.enter="doneEditAt(index)"
          @keyup.esc="resetEdit"
        >
        <button
          v-if="ability.can('delete', todo)"
          @click="emit('remove', todo)"
          class="destroy"
        ></button>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAbility } from '@casl/vue';
import type { AppAbility } from '../config/ability';
import type { Todo, TodoInput } from '../models/Todo';

export interface UpdateEvent {
  index: number
  patch: Partial<TodoInput>
}

const props = defineProps<{
  items: Todo[]
}>();

const emit = defineEmits<{
  update: [event: UpdateEvent]
  remove: [todo: Todo]
}>();

const ability = useAbility<AppAbility>();
const editedTitle = ref('');
const editedTodo = ref<Todo | null>(null);

function classesFor(todo: Todo) {
  return {
    todo: true,
    completed: todo.completed,
    editing: todo === editedTodo.value,
  };
}

function editTodo(todo: Todo) {
  if (!ability.can('update', todo)) {
    return;
  }

  editedTitle.value = todo.title;
  editedTodo.value = todo;
}

function updateTodoAt(index: UpdateEvent['index'], patch: UpdateEvent['patch']) {
  emit('update', {
    index,
    patch,
  });
}

function updateTodoCompletion(index: number, event: Event) {
  const { checked } = event.target as HTMLInputElement;
  updateTodoAt(index, { completed: checked });
}

function doneEditAt(index: number) {
  if (!editedTodo.value) {
    return;
  }

  const newTitle = editedTitle.value.trim();

  if (newTitle) {
    updateTodoAt(index, { title: newTitle });
  } else {
    emit('remove', props.items[index]);
  }

  resetEdit();
}

function resetEdit() {
  editedTodo.value = null;
  editedTitle.value = '';
}
</script>
