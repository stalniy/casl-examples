<template>
  <v-app>
    <v-navigation-drawer app mini-variant v-model="isVisibleMenu">
      <v-list dense class="pt-0">
        <v-list-tile to="/">
          <v-list-tile-action>
            <v-icon>home</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Home</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile :to="{ name: 'newArticle' }" v-if="$can('create', 'Article')">
          <v-list-tile-action>
            <v-icon>add_circle</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Add article</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <template v-if="isLoggedIn">
          <v-list-tile @click="logout" title="Log out">
            <v-list-tile-action>
              <v-icon>rowing</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Logout</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </template>
        <template v-else>
          <v-list-tile @click="$router.push('/login')" title="Log in">
            <v-list-tile-action>
              <v-icon>input</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Login</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </template>
      </v-list>
    </v-navigation-drawer>
    <v-content>
      <v-toolbar>
        <v-btn icon @click="isVisibleMenu = !isVisibleMenu">
          <v-icon>menu</v-icon>
        </v-btn>
        <v-toolbar-title>{{ pageTitle }}</v-toolbar-title>
        <v-spacer />
        <div v-if="email">{{ email }}</div>
      </v-toolbar>
      <v-container fluid fill-height>
        <router-view />
      </v-container>
    </v-content>
    <v-snackbar
      v-for="notification in notifications" :key="notification.id"
      :timeout="notification.timeout"
      :color="notification.type"
      top center
      @input="removeNotification(notification)"
      :value="true"
    >
      {{ notification.message }}
      <v-btn flat @click.native="removeNotification(notification)">&times;</v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
  import { mapActions, mapState, mapGetters } from 'vuex'

  export default {
    data: () => ({
      isVisibleMenu: false
    }),
    computed: {
      ...mapState(['pageTitle', 'email']),
      ...mapState('notifications', {
        notifications: 'stack'
      }),
      ...mapGetters(['isLoggedIn'])
    },
    methods: {
      ...mapActions('notifications', { removeNotification: 'remove' }),

      logout() {
        return this.$store.dispatch('logout')
          .then(() => {
            this.isVisibleMenu = false
            this.$router.replace('/login')
          })
      }
    }
  }
</script>
