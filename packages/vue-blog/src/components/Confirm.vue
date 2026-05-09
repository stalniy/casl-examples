<template>
  <div class="overlay" @click.self="cancel">
    <div
      class="dialog"
      role="dialog"
      aria-modal="true"
      :aria-label="title || 'Confirmation'"
      :style="{ width: `${mergedOptions.width}px` }"
    >
      <header v-if="title" class="dialog-header" :style="{ '--accent': accentColor }">
        <h2>{{ title }}</h2>
      </header>
      <div class="dialog-body">
        <p v-if="message">{{ message }}</p>
      </div>
      <footer class="dialog-actions">
        <button class="button button-muted" type="button" name="reject" @click="cancel">
          {{ mergedOptions.noLabel }}
        </button>
        <button class="button" type="button" name="confirm" :style="{ '--accent': accentColor }" @click="agree">
          {{ mergedOptions.yesLabel }}
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  message: String,
  title: String,
  params: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['close']);

const mergedOptions = computed(() => ({
  color: 'primary',
  width: 420,
  yesLabel: 'Yes',
  noLabel: 'No',
  ...props.params,
}));

const accentColor = computed(() => (
  mergedOptions.value.color === 'error' ? '#d64545' : '#1e6fd9'
));

function handleEscape(event) {
  if (event.key === 'Escape') {
    cancel();
  }
}

function agree() {
  emit('close', true);
}

function cancel() {
  emit('close', false);
}

onMounted(() => {
  window.addEventListener('keydown', handleEscape);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscape);
});
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  background: rgba(13, 18, 28, 0.58);
  padding: 1.5rem;
}

.dialog {
  max-width: 100%;
  border-radius: 22px;
  background: #ffffff;
  box-shadow: 0 24px 80px rgba(14, 18, 29, 0.26);
  overflow: hidden;
}

.dialog-header {
  padding: 1rem 1.25rem;
  background: color-mix(in srgb, var(--accent) 12%, white);
}

.dialog-header h2 {
  margin: 0;
  font-size: 1rem;
}

.dialog-body {
  padding: 1.25rem;
  color: #3f4654;
}

.dialog-body p {
  margin: 0;
  line-height: 1.6;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 0 1.25rem 1.25rem;
}

.button {
  border: 0;
  border-radius: 999px;
  padding: 0.8rem 1.2rem;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  color: #ffffff;
  background: var(--accent, #1e6fd9);
}

.button-muted {
  color: #1b2433;
  background: #eef2f8;
}
</style>
