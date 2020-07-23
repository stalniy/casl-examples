<template>
  <v-layout align-center justify-center>
   <v-flex xs12 sm8 md4>
     <v-card class="elevation-12">
       <v-toolbar dark color="primary">
         <v-toolbar-title>Login form</v-toolbar-title>
       </v-toolbar>
       <v-card-text>
         <v-form ref="form">
           <v-text-field prepend-icon="person" v-model="details.email" label="Email" type="email" required :rules="emailValidation"></v-text-field>
           <v-text-field prepend-icon="lock" v-model="details.password" label="Password" type="password" required :rules="passwordValidation"></v-text-field>
         </v-form>
       </v-card-text>
       <v-card-actions>
         <v-spacer></v-spacer>
         <v-btn color="primary" @click.native="loginUser">Login</v-btn>
       </v-card-actions>
     </v-card>
   </v-flex>
  </v-layout>
</template>

<script>
  import { mapActions, mapState } from 'vuex'
  import { required, email, minLength } from '../validation'

  export default {
    data() {
      return {
        details: {
          email: '',
          password: ''
        },
        emailValidation: [
          required,
          email
        ],
        passwordValidation: [
          required,
          minLength(6)
        ]
      }
    },
    methods: {
      ...mapActions(['login']),

      loginUser() {
        const isValid = this.$refs.form.validate(true)

        if (!isValid) {
          return
        }

        return this.login(this.details)
          .then(() => this.$router.push('/'))
          .catch(error => {
            this.$store.dispatch('notifications/error', error.message)
          })
      }
    },
    created() {
      this.$store.dispatch('setTitle', 'Login')
    }
  }
</script>
