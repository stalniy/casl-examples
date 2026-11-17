import { subject } from '@casl/ability';
import { defineAbilityFor } from './defineAbility.ts';

const user = { id: 1 };
const ability = defineAbilityFor(user);

const posts = [
  { title: 'Your draft', authorId: 1, published: false },
  { title: 'Someone else’s draft', authorId: 2, published: false },
  { title: 'Your published post', authorId: 1, published: true },
];

console.log('You can edit your own drafts. Authorship stays protected.\n');

console.table(
  posts.map(post => ({
    Post: post.title,
    Read: ability.can('read', subject('Post', post)),
    'Edit title': ability.can('update', subject('Post', post), 'title'),
    'Change author': ability.can('update', subject('Post', post), 'authorId'),
  }))
);

// Try it:
// 1. Change the second post’s authorId to 1. Can you edit it now?
// 2. Publish your draft. Can you still edit its title?
// 3. Add 'authorId' to the allowed fields in defineAbility.ts. Which results change?
