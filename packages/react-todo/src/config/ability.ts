import { AbilityBuilder, createMongoAbility, MongoAbility } from '@casl/ability';
import { Todo } from '../services/todo-storage';

type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';
type Subjects = 'Todo' | Todo | 'all';

export type AppAbility = MongoAbility<[Actions, Subjects]>;

export default function defineRulesFor(role: string) {
  const { can, rules } = new AbilityBuilder<AppAbility>(createMongoAbility);

  if (role === 'admin') {
    can('manage', 'all');
  } else {
    can(['read', 'create'], 'Todo');
    can(['update', 'delete'], 'Todo', { assignee: 'me' });
  }

  return rules;
}

export function buildAbilityFor(role: string): AppAbility {
  return createMongoAbility<AppAbility>(defineRulesFor(role), {
    // https://casl.js.org/v6/en/guide/subject-type-detection
    detectSubjectType: (object) => object!.type
  });
}
