import { defineAbility } from '@casl/ability';

export const ability = defineAbility((can, cannot) => {
  can('manage', 'all');
  cannot('delete', 'User');
});
