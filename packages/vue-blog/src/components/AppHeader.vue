<template>
  <header class="app-header">
    <div class="header-inner">
      <router-link to="/" class="brand" aria-label="CASL Journal home"><span class="brand-mark" aria-hidden="true">c.</span><span>CASL<span class="brand-divider">/</span><span class="brand-journal">journal</span></span></router-link>
      <nav class="header-nav" aria-label="Main navigation">
        <router-link to="/" :aria-current="route.name === 'home' ? 'page' : undefined">Journal</router-link>
        <a href="https://casl.js.org/">Documentation ↗</a>
        <a href="https://github.com/stalniy/casl">GitHub ↗</a>
      </nav>
      <div v-if="isLoggedIn" class="header-actions" @focusout="handleAccountBlur">
        <span id="user-email">{{ email }}</span>
        <button ref="menuButton" class="account-toggle" type="button" name="menu" aria-label="Account menu" :aria-expanded="menuOpen" aria-controls="account-actions" @click="menuOpen = !menuOpen" @keydown.esc="closeMenu">⋮</button>
        <div v-if="menuOpen" id="account-actions" class="account-menu" @keydown.esc="closeMenu">
          <router-link v-if="ability.can('create', 'Article')" id="create-article" :to="{ name: 'newArticle' }" @click="menuOpen = false">Add Article</router-link>
          <button id="logout" type="button" @click="logout">Logout</button>
        </div>
      </div>
      <button v-else class="button login-button" type="button" name="goToLogin" @click="goToLogin">Login</button>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useAbility } from '@casl/vue';

const store = useStore();
const router = useRouter();
const ability = useAbility();

const route = useRoute();
const menuOpen = ref(false);
const menuButton = ref(null);
const email = computed(() => store.state.email);
const isLoggedIn = computed(() => store.getters.isLoggedIn);
watch(() => route.fullPath, () => {
  menuOpen.value = false;
});

function handleAccountBlur(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    menuOpen.value = false;
  }
}

function closeMenu() {
  menuOpen.value = false;
  menuButton.value?.focus();
}

function goToLogin() {
  return router.push('/login');
}

function logout() {
  menuOpen.value = false;
  return store.dispatch('logout')
    .then(() => {
      router.replace('/login');
    });
}
</script>
