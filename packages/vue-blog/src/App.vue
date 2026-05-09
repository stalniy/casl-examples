<template>
  <div class="app-shell">
    <AppHeader />
    <main class="app-main">
      <router-view />
    </main>

    <div class="toast-stack">
      <transition-group name="toast">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="toast"
          :class="`toast-${notification.type}`"
        >
          <span>{{ notification.message }}</span>
          <button type="button" class="toast-close" @click="removeNotification(notification)">
            ×
          </button>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import AppHeader from './components/AppHeader.vue';

const store = useStore();

const notifications = computed(() => store.state.notifications.stack);

function removeNotification(notification) {
  return store.dispatch('notifications/remove', notification);
}
</script>

<style>
:root {
  font-family: "Avenir Next", "Segoe UI", sans-serif;
  color: #182131;
  background:
    radial-gradient(circle at top, rgba(92, 156, 255, 0.16), transparent 36%),
    linear-gradient(180deg, #f7f9fc 0%, #edf2f8 100%);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  color: #182131;
}

button,
input,
textarea {
  font: inherit;
}

a {
  color: inherit;
}

#app {
  min-height: 100vh;
}

.app-shell {
  min-height: 100vh;
}

.app-main {
  width: min(1040px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 1.5rem 0 4rem;
}

.panel {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(164, 178, 202, 0.28);
  border-radius: 28px;
  box-shadow: 0 28px 80px rgba(29, 41, 57, 0.08);
  backdrop-filter: blur(10px);
}

.button-link,
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border: 0;
  border-radius: 999px;
  padding: 0.85rem 1.25rem;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
}

.button {
  color: #ffffff;
  background: linear-gradient(135deg, #1f6feb, #0f86c9);
  box-shadow: 0 16px 32px rgba(31, 111, 235, 0.24);
}

.button-link:hover,
.button:hover {
  transform: translateY(-1px);
}

.button-secondary {
  color: #1a2434;
  background: #ebf1f8;
  box-shadow: none;
}

.button-danger {
  background: linear-gradient(135deg, #d84b4b, #b93131);
  box-shadow: 0 16px 32px rgba(192, 47, 47, 0.24);
}

.field {
  display: grid;
  gap: 0.5rem;
}

.field label {
  font-size: 0.92rem;
  font-weight: 700;
  color: #31405c;
}

.field input,
.field textarea {
  width: 100%;
  border: 1px solid #ced8e6;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  padding: 0.9rem 1rem;
  color: #182131;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.field input:focus,
.field textarea:focus {
  outline: none;
  border-color: #5b92e5;
  box-shadow: 0 0 0 4px rgba(91, 146, 229, 0.14);
}

.field-errors {
  display: grid;
  gap: 0.3rem;
  color: #c43b3b;
  font-size: 0.86rem;
}

.toast-stack {
  position: fixed;
  bottom: 1.25rem;
  left: 50%;
  z-index: 20;
  transform: translateX(-50%);
  width: min(90vw, 480px);
  display: grid;
  gap: 0.75rem;
}

.toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-radius: 18px;
  padding: 1rem 1.1rem;
  color: #ffffff;
  box-shadow: 0 18px 50px rgba(22, 26, 38, 0.18);
}

.toast-info {
  background: linear-gradient(135deg, #1f6feb, #0f86c9);
}

.toast-error {
  background: linear-gradient(135deg, #d84b4b, #b93131);
}

.toast-close {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 1.25rem;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 700px) {
  .app-main {
    width: min(100%, calc(100% - 1rem));
    padding-top: 1rem;
  }
}
</style>
