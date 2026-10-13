import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import type { Ability, ForcedSubject } from '@casl/ability';
import type { Article, User } from '../../domain.js';

export type Actions = 'manage' | 'read' | 'create' | 'update' | 'delete' | 'publish';
export type Subjects = 'User' | 'Article' | 'all'
  | (User & ForcedSubject<'User'>)
  | (Article & ForcedSubject<'Article'>);
export type AppAbility = Ability<[Actions, Subjects], any>;

export function defineRulesFor(user?: Pick<User, 'id' | 'role'>): AppAbility['rules'] {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility as any);
  if (user?.role === 'admin') can('manage', 'all');
  else {
    can('read', 'Article', { published: true });
    if (user?.role === 'writer') {
      can(['read', 'create', 'delete', 'update'], 'Article', { author: user.id });
      can('publish', 'Article', { author: user.id });
      can(['read', 'update'], 'User', { id: user.id });
    }
  }
  return build().rules;
}

export function defineAbilityFor(user?: Pick<User, 'id' | 'role'>): AppAbility {
  return createMongoAbility<AppAbility>(defineRulesFor(user) as any);
}
