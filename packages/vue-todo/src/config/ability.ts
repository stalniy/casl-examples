import { PureAbility, AbilityBuilder, Ability, detectSubjectType, AbilityClass, InferSubjects } from '@casl/ability';
import { Todo } from '../models/Todo'

type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';
type Subjects = InferSubjects<Todo> | 'all';

export type AppAbility = Ability<[Actions, Subjects]>;
export const AppAbility = Ability as AbilityClass<AppAbility>;

export function defineRulesFor(role: string) {
  const { can, rules } = new AbilityBuilder<AppAbility>();

  if (role === 'admin') {
    can('manage', 'all');
  } else {
    can('read', 'all');
    can('manage', 'Todo', { assignee: 'me' });
  }

  return rules;
}

/**
 * Read for details: https://stalniy.github.io/casl/v4/en/guide/subject-type-detection
 */
function detectAppSubjectType(subject?: Subjects) {
  if (subject && typeof subject === 'object' && subject.kind) {
    return subject.kind;
  }

  return detectSubjectType(subject);
}

export function buildAbilityFor(role: string) {
  return new AppAbility(defineRulesFor(role), {
    detectSubjectType: detectAppSubjectType,
  });
}
