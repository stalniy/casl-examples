import { AbilityBuilder, Ability } from '@casl/ability';
import { PrismaQuery, Subjects, createPrismaAbility } from '../../prismaAbilities';
import type { Article, Comment, User } from '../../prisma';

type AbilityUser = Pick<User, 'id' | 'role'>;

export type AppAbility = Ability<[string, 'all' | Subjects<{
  User: User;
  Article: Article;
  Comment: Comment;
}>], PrismaQuery>;

let ANONYMOUS_ABILITY: AppAbility;
export function defineAbilityFor(user?: AbilityUser) {
  if (user) return createPrismaAbility<AppAbility>(defineRulesFor(user));

  ANONYMOUS_ABILITY = ANONYMOUS_ABILITY || createPrismaAbility<AppAbility>(defineRulesFor());
  return ANONYMOUS_ABILITY;
}

export function defineRulesFor(user?: AbilityUser) {
  const builder = new AbilityBuilder<AppAbility>(createPrismaAbility);
  switch (user?.role) {
    case 'admin':
      defineAdminRules(builder);
      break;
    case 'writer':
      defineAnonymousRules(builder);
      defineWriterRules(builder, user);
      break;
    default:
      defineAnonymousRules(builder);
      break;
  }

  return builder.rules;
}

function defineAdminRules({ can }: AbilityBuilder<AppAbility>) {
  can('manage', 'all');
}

function defineWriterRules({ can }: AbilityBuilder<AppAbility>, user: AbilityUser) {
  can(['read', 'create', 'delete', 'update'], ['Article', 'Comment'], {
    author: user.id
  });
  can('publish', 'Article', {
    author: user.id,
  })
  can(['read', 'update'], 'User', { id: user.id });
}

function defineAnonymousRules({ can }: AbilityBuilder<AppAbility>) {
  can('read', ['Article', 'Comment'], { published: true });
}
