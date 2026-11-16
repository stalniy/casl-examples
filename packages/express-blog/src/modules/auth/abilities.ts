import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import type { MongoAbility } from '@casl/ability';
import type { Types } from 'mongoose';
import type Article from '../posts/model.ts';
import type Comment from '../comments/model.ts';
import type User from '../users/model.ts';

type Action = 'manage' | 'read' | 'create' | 'update' | 'delete' | 'publish';
type Subject = 'all' | 'Article' | 'Comment' | 'User'
  | InstanceType<typeof Article> | InstanceType<typeof Comment> | InstanceType<typeof User>;
export type AppAbility = MongoAbility<[Action, Subject]>;
type AppUser = { _id: Types.ObjectId; role?: string | null };

let anonymousAbility: AppAbility | undefined;

export function defineAbilityFor(user?: AppUser): AppAbility {
  if (user) {
    return createMongoAbility<AppAbility>(defineRulesFor(user));
  }

  anonymousAbility ??= createMongoAbility<AppAbility>(defineRulesFor());
  return anonymousAbility;
}

export function defineRulesFor(user?: AppUser) {
  const builder = new AbilityBuilder<AppAbility>(createMongoAbility);
  const role = user?.role && Object.hasOwn(ROLES, user.role)
    ? user.role as keyof Roles
    : 'anonymous';

  ROLES[role](user!, builder);

  return builder.rules;
}

type RolePermissionsDefs = (user: AppUser, builder: AbilityBuilder<AppAbility>) => void;
type Roles = {
  admin: RolePermissionsDefs;
  writer: RolePermissionsDefs;
  anonymous: (user: AppUser | undefined, builder: AbilityBuilder<AppAbility>) => void;
}
const ROLES: Roles = {
  admin(_, { can }) {
    can('manage', 'all');
  },
  writer(user, b) {
    ROLES.anonymous(user, b);
    const { can } = b;
    can(['read', 'create', 'delete', 'update'], ['Article', 'Comment'], {
      author: user._id
    });
    can('publish', 'Article', {
      author: user._id,
      published: false
    });
    can(['read', 'update'], 'User', { _id: user._id });
  },
  anonymous(_, { can }) {
    can('read', ['Article', 'Comment'], { published: true });
  }
};
