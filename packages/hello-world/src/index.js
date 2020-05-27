const ability = require('./defineAbility');

console.log('can read Post', ability.can('read', 'Post')) // true
console.log('can read User', ability.can('read', 'User')) // true
console.log('can update User', ability.can('update', 'User')) // true
console.log('can delete User', ability.can('delete', 'User')) // false
console.log('cannot delete User', ability.cannot('delete', 'User')) // true
