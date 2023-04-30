import { AbilityBuilder, PureAbility } from '@casl/ability';
import { PrismaQuery, Subjects, createPrismaAbility } from '@casl/prisma';
import { Article, Comment, User } from '@prisma/client';

export type AppAbility = PureAbility<[string, 'all' | Subjects<{
  User: User;
  Article: Article;
  Comment: Comment;
}>], PrismaQuery>;

let ANONYMOUS_ABILITY: AppAbility;
export function defineAbilityFor(user?: User) {
  if (user) return createPrismaAbility(defineRulesFor(user));

  ANONYMOUS_ABILITY = ANONYMOUS_ABILITY || createPrismaAbility(defineRulesFor());
  return ANONYMOUS_ABILITY;
}

export function defineRulesFor(user?: User) {
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

function defineWriterRules({ can }: AbilityBuilder<AppAbility>, user: User) {
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
