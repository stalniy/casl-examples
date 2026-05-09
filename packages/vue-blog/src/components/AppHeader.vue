<template>
  <header class="header-shell">
    <div class="header panel">
      <div>
        <p class="eyebrow">CASL Example</p>
        <h1>{{ pageTitle }}</h1>
      </div>

      <div v-if="isLoggedIn" class="header-actions">
        <span id="user-email" class="user-email">{{ email }}</span>
        <router-link
          v-if="ability.can('create', 'Article')"
          id="create-article"
          class="button-link button-secondary"
          :to="{ name: 'newArticle' }"
        >
          Add article
        </router-link>
        <button id="logout" class="button-link button-secondary" type="button" @click="logout">
          Logout
        </button>
      </div>

      <button v-else class="button" type="button" name="goToLogin" @click="goToLogin">
        Login
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useAbility } from '@casl/vue';

const store = useStore();
const router = useRouter();
const ability = useAbility();

const pageTitle = computed(() => store.state.pageTitle);
const email = computed(() => store.state.email);
const isLoggedIn = computed(() => store.getters.isLoggedIn);

function goToLogin() {
  return router.push('/login');
}

function logout() {
  return store.dispatch('logout')
    .then(() => {
      router.replace('/login');
    });
}
</script>

<style scoped>
.header-shell {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 1rem 1rem 0;
}

.header {
  width: min(1040px, 100%);
  margin: 0 auto;
  padding: 1.1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.eyebrow {
  margin: 0 0 0.25rem;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #6a7a95;
}

h1 {
  margin: 0;
  font-size: clamp(1.35rem, 2vw, 1.85rem);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.user-email {
  padding: 0.7rem 1rem;
  border-radius: 999px;
  background: #edf2f8;
  color: #34405a;
  font-size: 0.92rem;
}

@media (max-width: 700px) {
  .header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
