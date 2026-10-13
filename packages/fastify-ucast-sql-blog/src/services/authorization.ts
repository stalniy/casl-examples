import { rulesToAST } from '@casl/ability/extra';
import type { AppAbility } from '../domain.js';

import type { QueryFilter } from '../repositories/types.js';

export function accessFor(ability: AppAbility, action: 'read' | 'update' | 'delete', subjectType: 'Article' | 'User'): QueryFilter {
  const rules = ability.rulesFor(action, subjectType);
  if (!rules.length) return { kind: 'none' };
  const ast = rulesToAST(ability, action, subjectType);
  if (!ast) return { kind: 'none' };
  if (ast.operator === 'and' && Array.isArray(ast.value) && ast.value.length === 0) return { kind: 'all' };
  return { kind: 'ast', ast };
}
