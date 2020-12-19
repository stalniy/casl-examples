Cypress.Commands.add('findWhere', { prevSubject: true }, (subject, callback) => {
  const items = Array.from(subject);

  for (let i = 0; i < items.length; i++) {
    const $el = Cypress.$(items[i]);

    if (callback($el)) {
      return $el;
    }
  }

  return null;
});
