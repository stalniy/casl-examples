<template>
  <div class="app-shell">
    <aside class="sidebar">
      <a class="brand" href="https://casl.js.org/" aria-label="CASL documentation"><img class="brand-mark" :src="shield" alt="" width="35" height="42"> CASL</a>
      <div class="workspace-label">THE AUTHORIZATION PLAYGROUND</div>
      <a class="nav-item current" href="#workspace"><span aria-hidden="true">▦</span> My workspace <span class="nav-count">{{ todos.length }}</span></a>
      <a class="nav-item" href="https://casl.js.org/v6/en/guide/intro"><span aria-hidden="true">⌘</span> Explore CASL <span class="external">↗</span></a>
      <div class="sidebar-bottom">
        <div class="mini-orbit" aria-hidden="true">✳</div>
        <h3>Small rules.<br>Big possibilities.</h3>
        <p>Build permissions that grow with your ideas.</p>
        <a href="https://casl.js.org/">Meet CASL <span>↗</span></a>
        <div class="framework"><span class="vue-icon">V</span> Built with Vue <span class="status-dot"></span></div>
      </div>
    </aside>
    <div class="page">
      <header class="topbar"><div><span class="breadcrumb">Playground</span><span class="breadcrumb-slash">/</span> Todo workspace</div><a href="https://github.com/stalniy/casl">Star on GitHub <span aria-hidden="true">↗</span></a></header>
      <main id="workspace">
        <div class="page-heading">
          <div><div class="eyebrow"><span class="status-dot"></span> A LITTLE PRODUCTIVITY. A LOT OF POSSIBILITY.</div><h1>Your tasks. Your rules<span>.</span></h1><p>A space to get things done. Powered by permissions that make sense.</p></div>
          <span class="edition">CASL × Vue</span>
        </div>
        <div class="workspace-grid">
          <section class="todoapp" aria-labelledby="tasks-heading">
            <div class="section-heading"><div><span class="section-icon" aria-hidden="true">☷</span><h2 id="tasks-heading">My tasks</h2><span class="task-total">{{ todos.length }}</span></div><span class="live-label"><span class="status-dot"></span> Live playground</span></div>
            <Can I="create" a="Todo"><NewTodo @submit="addTodo" /></Can>
            <div class="list-toolbar">
              <div class="filters" role="group" aria-label="Filter tasks">
                <button v-for="option in filters" :key="option.value" type="button" :class="{ active: filter === option.value }" :aria-pressed="filter === option.value" @click="filter = option.value">{{ option.label }} <span v-if="option.value === 'all'">{{ todos.length }}</span></button>
              </div><span class="list-hint">Make something happen</span>
            </div>
            <TodoItems :items="visibleTodos" @update="updateTodo" @remove="removeTodo" />
            <div class="task-bottom"><span aria-live="polite">{{ remaining }} tasks left to do</span><span><span class="tiny-key">↵</span> to add · double-click a task to edit</span></div>
            <div class="playground-note"><span aria-hidden="true">ⓘ</span><p>This is your sandbox. Add a task, switch roles, and see authorization in action.<br><span>Tasks are saved in this browser. Come back and pick up where you left off.</span></p></div>
          </section>
          <TodoFooter />
        </div>
        <a class="promo-banner" href="https://casl.js.org/"><span class="promo-symbol" aria-hidden="true">✳</span><div><span class="eyebrow">MEET THE ENGINE BEHIND THE RULES</span><h2>Permission to build something great.</h2><p>CASL is an isomorphic authorization library for JavaScript. Simple, flexible, and made for your stack.</p></div><span class="promo-cta">Explore CASL <span>↗</span></span></a>
        <footer class="page-footer"><span>A tiny app. A powerful authorization library.</span><span>Made possible by <a href="https://casl.js.org/">CASL</a> <span class="footer-spark">✳</span></span></footer>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import TodoItems, { type UpdateEvent } from './TodoItems.vue';
import TodoFooter from './TodoFooter.vue';
import NewTodo from './NewTodo.vue';
import shield from '../assets/casl-shield.png';
import type { Todo, TodoInput } from '../models/Todo';
import storage from '../services/todo-storage';

const todos = ref<Todo[]>(storage.fetch());
const filters = [
  { value: 'all', label: 'All tasks' },
  { value: 'active', label: 'To do' },
  { value: 'completed', label: 'Completed' },
] as const;
const filter = ref<'all' | 'active' | 'completed'>('all');
const remaining = computed(() => todos.value.filter(todo => !todo.completed).length);
const visibleTodos = computed(() => todos.value.filter(todo =>
  filter.value === 'all' || (filter.value === 'completed' ? todo.completed : !todo.completed)));

watch(todos, nextTodos => storage.save(nextTodos), { deep: true, immediate: true });

function addTodo(todo: TodoInput) {
  todos.value.push(storage.build(todo));
  filter.value = 'all';
}

function updateTodo({ index, patch }: UpdateEvent) {
  Object.assign(visibleTodos.value[index], patch);
}

function removeTodo(todo: Todo) {
  todos.value.splice(todos.value.indexOf(todo), 1);
}
</script>
