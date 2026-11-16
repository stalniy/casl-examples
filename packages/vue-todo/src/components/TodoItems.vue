<template>
  <section class="main" aria-label="Tasks">
    <TransitionGroup v-if="items.length" name="task" tag="ul" class="todo-list">
      <li v-for="(todo, index) in items" :key="todo.id" :class="classesFor(todo)">
        <input
          v-if="ability.can('update', todo)"
          type="checkbox"
          class="toggle"
          :aria-label="`Mark ${todo.title} as ${todo.completed ? 'incomplete' : 'complete'}`"
          :checked="todo.completed"
          @input="updateTodoCompletion(index, $event)"
        >
        <span v-else class="locked-check" :title="todo.completed ? 'Completed · read only' : 'Only the assignee or an admin can change this task'" aria-hidden="true">{{ todo.completed ? '✓' : '−' }}</span>
        <div class="view">
          <label :tabindex="ability.can('update', todo) ? 0 : undefined" :role="ability.can('update', todo) ? 'button' : undefined" :title="ability.can('update', todo) ? 'Double-click or press Enter to edit' : 'Read only · switch to Admin to edit'" @dblclick="editTodo(todo)" @keydown.enter.prevent="editTodo(todo)">{{ todo.title }}</label>
        </div>
        <input class="edit"
          v-if="todo === editedTodo && ability.can('update', todo)"
          :ref="focusEditor"
          aria-label="Edit task title"
          v-model.trim="editedTitle"
          @blur="doneEditAt(index)"
          @keyup.enter="doneEditAt(index)"
          @keyup.esc="resetEdit"
        >
        <span class="assignee"><span class="avatar" :class="{ own: todo.assignee === 'me' }" aria-hidden="true">{{ todo.assignee === 'me' ? 'Y' : todo.assignee.split(' ').map(part => part[0]).join('') }}</span>{{ todo.assignee === 'me' ? 'You' : todo.assignee }}</span>
        <button
          v-if="ability.can('delete', todo)"
          @click="emit('remove', todo)"
          class="destroy"
          type="button"
          :aria-label="`Delete ${todo.title}`"
        ></button>
        <span v-else class="read-only">Read only</span>
      </li>
    </TransitionGroup>
    <div v-else class="empty-state" role="status"><span aria-hidden="true">✳</span><h3>A little room for your next idea.</h3><p>No tasks here. Add a task or try another filter.</p></div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, type ComponentPublicInstance } from 'vue';
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

function focusEditor(element: Element | ComponentPublicInstance | null) {
  if (element instanceof HTMLInputElement) element.focus();
}

watch(() => ability.rules, () => {
  if (editedTodo.value && !ability.can('update', editedTodo.value)) resetEdit();
});

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
