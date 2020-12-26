import { AbilityBuilder, Ability, AbilityClass, InferSubjects } from '@casl/ability';
import { Todo } from '../models/Todo'

type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';
type Subjects = InferSubjects<Todo> | 'all';

export type AppAbility = Ability<[Actions, Subjects]>;
export const AppAbility = Ability as AbilityClass<AppAbility>;

export function defineAbilitiesFor(role: string) {
  const { can, rules } = new AbilityBuilder(AppAbility);

  if (role === 'admin') {
    can('manage', 'all');
  } else {
    can('read', 'all');
    can('manage', 'Todo', { assignee: 'me' });
  }

  return rules;
}

export function createAbility() {
  return new AppAbility(defineAbilitiesFor('member'), {
    // https://casl.js.org/v5/en/guide/subject-type-detection
    detectSubjectType: object => object.kind,
  });
}
