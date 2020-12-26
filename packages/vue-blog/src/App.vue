<template>
  <v-app>
    <v-content>
      <AppHeader />
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
  import AppHeader from './components/AppHeader'

  export default {
    name: 'App',
    components: {
      AppHeader
    },
    computed: {
      ...mapState('notifications', {
        notifications: 'stack'
      }),
    },
    methods: {
      ...mapActions('notifications', { removeNotification: 'remove' }),
    }
  }
</script>
