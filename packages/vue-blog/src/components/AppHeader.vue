<template>
  <v-toolbar class="app-header">
    <v-toolbar-title>{{ pageTitle }}</v-toolbar-title>
    <v-spacer />
    <template v-if="isLoggedIn">
      <div id="user-email">{{ email }}</div>
      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon name="menu" v-on="on" v-bind="attrs">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list dense class="pt-0">
          <v-list-tile :to="{ name: 'newArticle' }" v-if="$can('create', 'Article')" id="create-article">
            <v-list-tile-title>Add article</v-list-tile-title>
          </v-list-tile>
          <v-list-tile @click="logout" title="Log out" id="logout">
            <v-list-tile-title>Logout</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
    </template>
    <v-btn flat v-else @click="goToLogin" name="goToLogin">Login</v-btn>
  </v-toolbar>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
  name: 'AppHeader',
  computed: {
    ...mapState(['pageTitle', 'email']),
    ...mapGetters(['isLoggedIn'])
  },
  methods: {
    goToLogin() {
      return this.$router.push('/login');
    },
    logout() {
      return this.$store.dispatch('logout')
        .then(() => {
          this.$router.replace('/login')
        })
    }
  }
}
</script>
