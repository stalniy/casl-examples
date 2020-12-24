export function login(email, password = '123456') {
  cy.visit('/login');

  cy.get('body').then(($body) => {
    if ($body.find('#user-email').length) {
      logout();
    }

    cy.get('input[type=email]')
      .type('{selectall}')
      .type(email);

    cy.get('input[type=password]')
      .type('{selectall}')
      .type(password);

    cy.get('*[name=login]').click();
    cy.wait(500);
  })
}

export function logout() {
  cy.get('.app-header *[name=menu]').click();
  cy.wait(200);
  cy.get('#logout').click();
}

export function createArticle(article) {
  cy.get('.app-header *[name=menu]').click();
  cy.get('#create-article').click();

  fillArticleForm({
    published: true,
    body: 'Default',
    ...article
  });
  cy.get('*[name=save]').click();
  cy.wait(1000);
}

function fillArticleForm(article) {
  if (article.title) {
    cy.get('input[name=title]')
      .type('{selectall}')
      .type(article.title);
  }

  if (article.body) {
    cy.get('textarea[name=content]')
      .type('{selectall}')
      .type(article.body);
  }

  if (article.published) {
    cy.get('.checkbox[name=published] label').click();
  }
}

export function updateArticle(article, changes) {
  cy.get('.article')
    .findWhere(el => el.find('h3').text().trim() === article.title)
    .find('*[name=edit]')
    .click();

  fillArticleForm(changes);
  cy.get('*[name=save]').click();
  cy.wait(1000);
}

export function deleteArticle(article) {
  cy.get('.article')
    .findWhere(el => el.find('h3').text() === article.title)
    .find('*[name=delete]')
    .click();

  cy.get('*[name=confirm]').click();
  cy.wait(1000);
}

export function ensureHasArticle(article) {
  cy.get('.article')
    .findWhere(el => el.find('h3').text() === article.title)
    .then(($article) => {
      if (!$article) {
        createArticle(article);
      }
    });
}
