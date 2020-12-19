import { login } from './actions';

describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login')
  });

  it('can login as a writer@casl.io', () => {
    const email = 'writer@casl.io';
    login(email);

    cy.get('#userEmail').should('have.text', email);
  })

  it('can login as a another.writer@casl.io', () => {
    const email = 'another.writer@casl.io';
    login(email);

    cy.get('#userEmail').should('have.text', email);
  })

  it('can login as an admin admin@casl.io', () => {
    const email = 'admin@casl.io';
    login(email);

    cy.get('#userEmail').should('have.text', email);
  })

  it('requires email to be non-empty', () => {
    login(' ');

    cy.get('.v-messages__message').should('exist');
  })

  it('requires password to be non-empty', () => {
    login('some.email@example.com', ' ');

    cy.get('.v-messages__message').should('exist');
  })
})
