import { rulesToAST } from '@casl/ability/extra';
import type { AppAbility } from '../domain.js';

export type Access = { kind: 'all' } | { kind: 'none' } | { kind: 'ast'; ast: any };

export function accessFor(ability: AppAbility, action: 'read' | 'update' | 'delete', subjectType: 'Article' | 'User'): Access {
  const rules = ability.rulesFor(action, subjectType);
  if (!rules.length) return { kind: 'none' };
  const ast = (rulesToAST as any)(ability, action, subjectType);
  if (!ast) return { kind: 'none' };
  if (ast.operator === 'and' && Array.isArray(ast.value) && ast.value.length === 0) return { kind: 'all' };
  return { kind: 'ast', ast };
}
