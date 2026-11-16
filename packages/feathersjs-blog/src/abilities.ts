import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import type { MongoAbility } from '@casl/ability';
import type { Types } from 'mongoose';
import type { BlogRecord } from './models/index.ts';

export type Action = 'manage' | 'read' | 'create' | 'update' | 'delete' | 'publish';
type Subject = 'all' | 'User' | 'Article' | 'Comment' | BlogRecord;
export type AppAbility = MongoAbility<[Action, Subject]>;

export function defineAbilityFor(user?: { _id: Types.ObjectId; role?: string | null }): AppAbility {
  const { can, rules } = new AbilityBuilder<AppAbility>(createMongoAbility);
  if (user?.role === 'admin') {
    can('manage', 'all');
  } else {
    can('read', ['Article', 'Comment'], { published: true });
    if (user?.role === 'writer') {
      can(['read', 'create', 'delete', 'update'], ['Article', 'Comment'], { author: user._id });
      can('publish', 'Article', { author: user._id, published: false });
      can(['read', 'update'], 'User', { _id: user._id });
    }
  }
  return createMongoAbility(rules);
}
