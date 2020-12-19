import { login, logout, createArticle, updateArticle, deleteArticle } from './actions';

describe('Articles', () => {
  const publishedArticleTitle = `published article ${Date.now()}`;
  const draftArticleTitle = `draft article ${Date.now()}`;

  before(() => {
    login('another.writer@casl.io');
    createArticle({ title: publishedArticleTitle });
    createArticle({
      title: draftArticleTitle,
      published: false
    });
    logout();
  })

  describe('when user is not logged in', () => {
    before(() => {
      cy.visit('/');
    });

    itBehavesAsUser();

    it('cannot create article', () => {
      cy.get('body')
        .then(($body) => {
          expect($body.find('#create-article').length).to.equal(0);
        })
    })
  })

  describe('when user is a writer', () => {
    before(() => {
      login('writer@casl.io');
    })

    itBehavesAsUser('.article:not(.own)');
    itBehavesAsAuthor();
  })

  describe('when user is an admin', () => {
    const notOwnArticle = { title: `Someone else article ${Date.now()}` };

    before(() => {
      login('another.writer@casl.io');
      createArticle(notOwnArticle);
      logout();
    })

    before(() => {
      login('admin@casl.io');
    })

    itBehavesAsAuthor();

    it('can see others drafts', () => {
      cy.get('.article h3').findWhere(el => el.text() === draftArticleTitle).should('exist');
    });

    it('can change others articles', () => {
      cy.get('.article:not(.own) a[name=edit]').should('exist');
    });

    it('can delete others articles', () => {
      cy.get('.article:not(.own) button[name=delete]').should('exist');
    });
  })

  function itBehavesAsUser(ownArticlesSelector = '.article') {
    it('can see published articles', () => {
      cy.get('.article h3').findWhere(el => el.text() === publishedArticleTitle).should('exist');
    })

    it('cannot see others drafts', () => {
      cy.get('.article h3').should('not.have.text', draftArticleTitle);
    })

    it('cannot delete others articles', () => {
      cy.get(`${ownArticlesSelector} button[name=delete]`).should('not.exist');
    })

    it('cannot change others articles', () => {
      cy.get(`${ownArticlesSelector} .article a[name=edit]`).should('not.exist');
    })
  }

  function itBehavesAsAuthor() {
    const article = { title: `own article ${Date.now()}` };

    before(() => {
      createArticle(article);
    })

    it('can create own article', () => {
      cy.get('.article h3').findWhere(el => el.text() === article.title).should('exist');
    })

    it('can update own article', () => {
      const newTitle = `UPDATED: ${article.title}`;
      updateArticle(article, { title: newTitle });

      cy.get('.article h3').findWhere(el => el.text() === newTitle).should('exist');
      updateArticle({ title: newTitle }, { title: article.title });
    })

    it('can delete own article', () => {
      deleteArticle(article);

      cy.get('.article h3').findWhere(el => el.text().includes(article.title)).should('not.exist');
    })

    it('can create draft article', () => {
      const title = `DRAFT: ${Date.now()}`;
      createArticle({ title, published: false });

      cy.get('.article.draft h3').findWhere(el => el.text() === title).should('exist');
    })

    it('can publish draft', () => {
      const title = `DRAFT2: ${Date.now()}`;
      createArticle({ title, published: false });
      updateArticle({ title }, { published: true });

      cy.get('.article:not(.draft) h3').findWhere(el => el.text() === title).should('exist');
    })
  }
})
