const { AbilityBuilder, Ability } = require('@casl/ability');

let ANONYMOUS_ABILITY;

function defineAbilityFor(user) {
  if (user) {
    return new Ability(defineRulesFor(user));
  }

  ANONYMOUS_ABILITY = ANONYMOUS_ABILITY || new Ability(defineRulesFor({}));
  return ANONYMOUS_ABILITY;
}

function defineRulesFor(user) {
  const builder = new AbilityBuilder(Ability);

  switch (user.role) {
    case 'admin':
      defineAdminRules(builder, user);
      break;
    case 'writer':
      defineAnonymousRules(builder);
      defineWriterRules(builder, user);
      break;
    default:
      defineAnonymousRules(builder, user);
      break;
  }

  return builder.rules;
}

function defineAdminRules({ can }) {
  can('manage', 'all');
}

function defineWriterRules({ can }, user) {
  can(['read', 'create', 'delete', 'update'], ['Article', 'Comment'], {
    author: user._id
  });
  can('publish', 'Article', {
    author: user._id,
    published: false
  })
  can(['read', 'update'], 'User', { _id: user._id });
}

function defineAnonymousRules({ can }) {
  can('read', ['Article', 'Comment'], { published: true });
}

module.exports = {
  defineRulesFor,
  defineAbilityFor,
};
