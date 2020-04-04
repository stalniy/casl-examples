import ability from './defineAbility.mjs';

ability.can('read', 'Post') // true
ability.can('read', 'User') // true
ability.can('update', 'User') // true
ability.can('delete', 'User') // false
ability.cannot('delete', 'User') // true
