<template>
  <footer class="footer">
    <span class="todo-count">
      <strong>{{ remaining }}</strong> left
    </span>
    <ul class="roles">
      <li class="help" title="Admin - can do anything. Member can read everything and manage todos with assignee 'me'">Switch roles</li>
      <li><button type="button" :class="{ selected: role === 'admin' }" @click="setRole('admin')">Admin</button></li>
      <li><button type="button" :class="{ selected: role === 'member' }" @click="setRole('member')">Member</button></li>
    </ul>
  </footer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAbility } from '@casl/vue';
import { defineRulesFor, type AppAbility } from '../config/ability';
import type { Todo } from '../models/Todo';

type Role = 'admin' | 'member';

const props = defineProps<{
  items: Todo[]
}>();

const ability = useAbility<AppAbility>();
const role = ref<Role>('member');
const remaining = computed(() => props.items.filter((item) => !item.completed).length);

function setRole(nextRole: Role) {
  role.value = nextRole;
  ability.update(defineRulesFor(nextRole));
}
</script>
