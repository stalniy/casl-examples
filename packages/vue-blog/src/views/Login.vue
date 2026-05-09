<template>
  <section class="login-layout">
    <div class="login-card panel">
      <div class="login-copy">
        <p class="login-kicker">Sign in</p>
        <h2>Welcome back</h2>
        <p>Use the demo API credentials from the server example to load your CASL rules and manage articles.</p>
      </div>

      <form class="login-form" @submit.prevent="loginUser">
        <div class="field">
          <label for="email">Email</label>
          <input id="email" v-model.trim="details.email" type="email" autocomplete="email" />
          <div v-if="errors.email.length" class="field-errors">
            <span v-for="error in errors.email" :key="error">{{ error }}</span>
          </div>
        </div>

        <div class="field">
          <label for="password">Password</label>
          <input id="password" v-model="details.password" type="password" autocomplete="current-password" />
          <div v-if="errors.password.length" class="field-errors">
            <span v-for="error in errors.password" :key="error">{{ error }}</span>
          </div>
        </div>

        <button class="button" type="submit" name="login">Login</button>
      </form>
    </div>
  </section>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { required, email, minLength } from '../validation';

const store = useStore();
const router = useRouter();

const details = reactive({
  email: '',
  password: '',
});

const errors = reactive({
  email: [],
  password: [],
});

function validateField(value, validators) {
  return validators
    .map((validator) => validator(value))
    .filter((result) => result !== true);
}

function validate() {
  errors.email = validateField(details.email, [required, email]);
  errors.password = validateField(details.password, [required, minLength(6)]);

  return !errors.email.length && !errors.password.length;
}

function loginUser() {
  if (!validate()) {
    return;
  }

  return store.dispatch('login', details)
    .then(() => router.push('/'))
    .catch((error) => {
      store.dispatch('notifications/error', error.message);
    });
}

onMounted(() => {
  store.dispatch('setTitle', 'Login');
});
</script>

<style scoped>
.login-layout {
  min-height: calc(100vh - 10rem);
  display: grid;
  place-items: center;
}

.login-card {
  width: min(100%, 860px);
  display: grid;
  grid-template-columns: 1fr 1fr;
  overflow: hidden;
}

.login-copy {
  padding: 2rem;
  color: #ffffff;
  background: linear-gradient(145deg, #163b79, #1d7db1);
}

.login-kicker {
  margin: 0 0 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-weight: 800;
  opacity: 0.8;
}

.login-copy h2 {
  margin: 0 0 1rem;
  font-size: clamp(2rem, 4vw, 2.8rem);
}

.login-copy p {
  margin: 0;
  line-height: 1.7;
}

.login-form {
  display: grid;
  gap: 1.15rem;
  padding: 2rem;
  align-content: center;
}

@media (max-width: 800px) {
  .login-card {
    grid-template-columns: 1fr;
  }
}
</style>
