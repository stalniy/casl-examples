import { AbilityBuilder, createMongoAbility, subject as caslSubject } from '@casl/ability';
import type { Ability } from '@casl/ability';

export type Role = 'admin' | 'writer' | '';
export type User = { id: string; name: string | null; email: string; password: string; role: Role; createdAt: Date; updatedAt: Date };
export type Article = { id: string; author: string; title: string; body: string; published: boolean; createdAt: Date; updatedAt: Date; createdBy?: Pick<User, 'id' | 'email'> };
export type Actions = 'manage' | 'read' | 'create' | 'update' | 'delete' | 'publish';
export type Subjects = 'User' | 'Article' | 'all';
export type AppAbility = Ability<[Actions, Subjects], any>;
export const subject = caslSubject;

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
