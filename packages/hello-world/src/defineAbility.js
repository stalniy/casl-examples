const { defineAbility } = require('@casl/ability');

module.exports = defineAbility((can, cannot) => {
  can('manage', 'all');
  cannot('delete', 'User');
});
