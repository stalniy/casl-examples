<template>
  <div class="app-shell">
    <AppHeader />
    <main id="main-content" class="app-main">
      <router-view />
    </main>

    <footer class="site-footer">
      <a href="https://casl.js.org/" class="footer-brand">c. <strong>CASL</strong></a>
      <span>Good boundaries. Endless possibilities.</span>
      <a href="https://github.com/stalniy/casl-examples">Explore this example ↗</a>
    </footer>
    <div class="toast-stack" aria-live="polite">
      <transition-group name="toast">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="toast"
          :class="`toast-${notification.type}`"
        >
          <span>{{ notification.message }}</span>
          <button type="button" class="toast-close" aria-label="Dismiss notification" @click="removeNotification(notification)">
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
import './style.css';

const store = useStore();

const notifications = computed(() => store.state.notifications.stack);

function removeNotification(notification) {
  return store.dispatch('notifications/remove', notification);
}
</script>
