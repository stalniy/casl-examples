import { defineAbility } from '@casl/ability';

export function defineAbilityFor(user: { id: number }) {
  return defineAbility((can, cannot) => {
    can('read', 'Post');
    can('update', 'Post', ['title', 'body'], { authorId: user.id });
    cannot('update', 'Post', { published: true });
  });
}
