<template>
  <section class="login-page">
    <div class="login-card">
      <div class="page-intro">
        <span class="eyebrow">YOUR NEXT CHAPTER</span>
        <h1>Welcome back.</h1>
        <p>Sign in to share your perspective and see CASL permissions in action.</p>
      </div>

      <form class="login-form form-panel" @submit.prevent="loginUser">
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
