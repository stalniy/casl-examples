describe('Todo app', () => {
  before(() => {
    cy.visit('/')
  })

  it('has main screen', () => {
    cy.get('input[name=title]').should('exist')
    cy.get('select[name=assignee]').should('exist');
    cy.get('.footer').should('exist');
  });

  describe('user as a "member"', () => {
    before(() => {
      selectRole('Member');
    });

    managingOwnTasks();

    it('create a task and assign it to somebody', () => {
      const todo = createTodo('somebody else task', 'John Doe');
      todo().should('exist');
    });

    it('cannot change somebody else tasks', () => {
      const todo = createTodo('somebody else task to change', 'John Doe');

      todo().find('label').dblclick();
      todo().find('input.edit').should('not.exist');
    });

    it('cannot delete somebody else tasks', () => {
      const todo = createTodo('somebody else task to delete', 'John Doe');

      todo().find('button.destroy').should('not.exist');
    });
  })

  describe('user as an "admin"', () => {
    before(() => {
      selectRole('Admin');
    });

    managingOwnTasks();

    it('can change somebody else tasks', () => {
      const todo = createTodo('somebody else task to change', 'John Doe');
      const newTitle = 'changed by admin';

      todo().find('label').dblclick();
      todo().find('input.edit')
        .type('{selectall}')
        .type(newTitle)
        .type('{enter}');

      todo().find('label').should('have.text', newTitle);
    });

    it('can delete somebody else tasks', () => {
      const todo = createTodo('somebody else task to delete', 'John Doe');
      const current = todo();

      current.find('button.destroy').click();
      current.should('not.exist');
    });
  })

  function managingOwnTasks() {
    it('can create task and assign it to yourself', () => {
      const title = genTitle('new todo');
      const todo = createTodo(title, 'me');

      todo().find('label').should('have.text', title);
    });

    it('can change own task', () => {
      const title = genTitle('edit');
      const todo = createTodo(title, 'me');

      todo().find('label').dblclick();
      todo().find('input.edit')
        .type('_changed')
        .type('{enter}');
      todo().find('input.toggle').click();

      todo().find('label').should('have.text', `${title}_changed`);
      todo().should('have.class', 'completed');
    })

    it('can delete own task', () => {
      const title = genTitle();
      const todo = createTodo(title, 'me');
      const currentTodo = todo();

      currentTodo.find('button.destroy').click();
      currentTodo.should('not.exist');
    })
  }

  function createTodo(title, assignee) {
    cy.get('select[name=assignee]').select(assignee);
    cy.get('input[name=title]')
      .type(title)
      .type('{enter}');


    return () => cy.get('.todo-list .todo').last();
  }

  function selectRole(name) {
    cy.get('.roles button').contains(name).click();
  }

  function genTitle(prefix = 'todo') {
    return `${prefix} #${Date.now()}`;
  }
})
