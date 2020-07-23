<template>
  <v-dialog v-model="dialog" :max-width="options.width" @keydown.esc="cancel">
    <v-toolbar dark :color="options.color" dense v-if="title">
      <v-toolbar-title>{{ title }}</v-toolbar-title>
    </v-toolbar>
    <v-card tile>
      <v-card-text v-show="!!message">{{ message }}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :color="options.color" flat="flat" @click="agree">{{ options.yesLabel }}</v-btn>
        <v-btn flat="flat" @click="cancel">{{ options.noLabel }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    props: {
      message: String,
      title: String,
      params: Object
    },

    data() {
      return {
        dialog: false,
        options: {
          color: 'primary',
          width: 290,
          yesLabel: 'Yes',
          noLabel: 'No'
        }
      }
    },
    methods: {
      agree() {
        this.dialog = false
        this.$emit('close', true)
      },

      cancel() {
        this.dialog = false
        this.$emit('close', false)
      },

      open() {
        this.dialog = true
      }
    },
    created() {
      Object.assign(this.options, this.params)
    }
  }
</script>
