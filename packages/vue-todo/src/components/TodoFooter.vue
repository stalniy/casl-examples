<template>
  <footer class="footer">
    <span class="todo-count">
      <strong>{{ remaining }}</strong> left
    </span>
    <ul class="filters">
      <li class="help" title="Admin - can do anything. Member can read everything and manage todos with assignee 'me'">Switch roles</li>
      <li><button type="button" :class="{ selected: role === 'admin' }" @click="setRole('admin')">Admin</button></li>
      <li><button type="button" :class="{ selected: role === 'member' }" @click="setRole('member')">Member</button></li>
    </ul>
  </footer>
</template>

<script lang="ts">
import Vue from 'vue';
import { defineRulesFor } from '../config/ability';
import { Todo } from '../models/Todo';

export default Vue.extend({
  name: 'TodoFooter',
  props: {
    items: {
      type: Array as () => Todo[],
      required: true,
    }
  },
  data: () => ({
    role: 'member'
  }),
  computed: {
    remaining(): number {
      return this.items.filter(item => !item.completed).length;
    },
  },
  methods: {
    setRole(role: string) {
      this.role = role;
      this.$ability.update(defineRulesFor(role));
    }
  },
});
</script>
