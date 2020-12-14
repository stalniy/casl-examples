import { AbilityBuilder, Ability, AbilityClass, InferSubjects } from '@casl/ability';
import { Todo } from '../models/Todo'

type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';
type Subjects = InferSubjects<Todo> | 'all';

export type AppAbility = Ability<[Actions, Subjects]>;
export const AppAbility = Ability as AbilityClass<AppAbility>;

export function defineRulesFor(role: string) {
  const { can, rules } = new AbilityBuilder(AppAbility);

  if (role === 'admin') {
    can('manage', 'all');
  } else {
    can('read', 'all');
    can(['create', 'update', 'delete'], 'Todo', { assignee: 'me' });
  }

  return rules;
}

export function buildAbilityFor(role: string) {
  return new AppAbility(defineRulesFor(role), {
    /**
     * Read for details: https://casl.js.org/v5/en/guide/subject-type-detection
     */
    detectSubjectType: object => object!.kind,
  });
}
