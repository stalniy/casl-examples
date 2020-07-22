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
  const { rules, can } = new AbilityBuilder();

  switch (user.role) {
    case 'admin':
      defineAdminRules(user, can);
      break;
    case 'writer':
      defineWriterRules(user, can);
      break;
    default:
      defineAnonymousRules(user, can);
      break;
  }

  return rules;
}

function defineAdminRules(_, can) {
  can('manage', 'all');
}

function defineWriterRules(user, can) {
  defineAnonymousRules(user, can);

  can(['read', 'create', 'delete', 'update'], ['Article', 'Comment'], {
    author: user._id
  });
  can('publish', 'Article', {
    author: user._id,
    published: false
  })
  can(['read', 'update'], 'User', { _id: user._id });
}

function defineAnonymousRules(_, can) {
  can('read', ['Article', 'Comment'], { published: true });
}

module.exports = {
  defineRulesFor,
  defineAbilityFor,
};
