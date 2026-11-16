<template>
  <aside class="footer" aria-labelledby="permissions-heading">
    <div class="permission-heading"><img class="shield-icon" :src="shield" alt="" width="25" height="30"><span class="eyebrow">POWERED BY CASL</span><span class="status-dot"></span></div>
    <h2 id="permissions-heading">A role changes everything.</h2>
    <p>Same tasks. Different permissions.<br>Switch roles to see the magic.</p>
    <div class="role-label">EXPLORE AS</div>
    <div class="roles" role="group" aria-label="Switch roles">
      <button v-for="name in roles" :key="name" type="button" :class="{ selected: role === name }" :aria-pressed="role === name" @click="setRole(name)">{{ name === 'member' ? 'Member' : 'Admin' }}</button>
    </div>
    <div class="role-description" aria-live="polite"><strong>{{ role === 'admin' ? 'The whole workspace is yours.' : 'Your tasks, your control.' }}</strong><p>{{ role === 'admin' ? 'Manage every task, no matter who it belongs to.' : 'View every task. Edit, complete, and delete only the ones assigned to you.' }}</p></div>
    <div class="permission-list"><div><span>✓</span> View all tasks</div><div><span>✓</span> Create new tasks</div><div><span>✓</span> Manage your own tasks</div><div :class="{ restricted: role !== 'admin' }"><span>{{ role === 'admin' ? '✓' : '−' }}</span> Manage others’ tasks</div></div>
    <div class="rule-snippet"><div><span class="code-dot"></span> THE RULE BEHIND IT</div><code v-if="role === 'admin'"><span>can</span>(<span class="code-string">'manage'</span>, <span class="code-string">'all'</span>);</code><code v-else><span>can</span>([<span class="code-string">'read'</span>, <span class="code-string">'create'</span>], <span class="code-string">'Todo'</span>);<br><span>can</span>([<span class="code-string">'update'</span>, <span class="code-string">'delete'</span>],<br>&nbsp; <span class="code-string">'Todo'</span>, { assignee: <span class="code-string">'me'</span> });</code></div>
    <a class="rules-link" href="https://casl.js.org/v6/en/guide/intro">A few lines. Fine-grained control. <span>↗</span></a>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAbility } from '@casl/vue';
import { defineRulesFor, type AppAbility } from '../config/ability';
import shield from '../assets/casl-shield.png';

type Role = 'admin' | 'member';
const roles = ['member', 'admin'] as const;
const ability = useAbility<AppAbility>();
const role = ref<Role>('member');

function setRole(nextRole: Role) {
  role.value = nextRole;
  ability.update(defineRulesFor(nextRole));
}
</script>
