import { subject as caslSubject } from '@casl/ability';

export type Role = 'admin' | 'writer' | '';
export type User = { id: string; name: string | null; email: string; password: string; role: Role; createdAt: Date; updatedAt: Date };
export type Article = { id: string; author: string; title: string; body: string; published: boolean; createdAt: Date; updatedAt: Date; createdBy?: Pick<User, 'id' | 'email'> };
export const subject = caslSubject;

export { defineAbilityFor, defineRulesFor } from './modules/auth/abilities.js';
export type { Actions, Subjects, AppAbility } from './modules/auth/abilities.js';
