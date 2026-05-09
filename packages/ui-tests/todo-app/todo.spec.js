const { test, expect } = require('@playwright/test');

test.describe('Todo app', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has main screen', async ({ page }) => {
    await expect(page.locator('input[name="title"]')).toBeVisible();
    await expect(page.locator('select[name="assignee"]')).toBeVisible();
    await expect(page.locator('.footer')).toBeVisible();
  });

  test.describe('user as a "member"', () => {
    test.beforeEach(async ({ page }) => {
      await selectRole(page, 'Member');
    });

    managingOwnTasks();

    test('create a task and assign it to somebody', async ({ page }) => {
      const todo = await createTodo(page, uniqueTitle('somebody else task'), 'John Doe');

      await expect(todo).toBeVisible();
    });

    test('cannot change somebody else tasks', async ({ page }) => {
      const todo = await createTodo(page, uniqueTitle('somebody else task to change'), 'John Doe');

      await todo.locator('label').dblclick();
      await expect(todo.locator('input.edit')).toHaveCount(0);
    });

    test('cannot delete somebody else tasks', async ({ page }) => {
      const todo = await createTodo(page, uniqueTitle('somebody else task to delete'), 'John Doe');

      await expect(todo.locator('button.destroy')).toHaveCount(0);
    });
  });

  test.describe('user as an "admin"', () => {
    test.beforeEach(async ({ page }) => {
      await selectRole(page, 'Admin');
    });

    managingOwnTasks();

    test('can change somebody else tasks', async ({ page }) => {
      const title = uniqueTitle('somebody else task to change');
      const todo = await createTodo(page, title, 'John Doe');
      const newTitle = uniqueTitle('changed by admin');

      await todo.locator('label').dblclick();
      const editInput = editingTodoInput(page);
      await expect(editInput).toBeVisible();
      await editInput.fill(newTitle);
      await editInput.press('Enter');

      await expect(todoByTitle(page, newTitle).locator('label')).toHaveText(newTitle);
    });

    test('can delete somebody else tasks', async ({ page }) => {
      const title = uniqueTitle('somebody else task to delete');
      const todo = await createTodo(page, title, 'John Doe');

      await todo.hover();
      await todo.locator('button.destroy').click();
      await expect(todoByTitle(page, title)).toHaveCount(0);
    });
  });
});

function managingOwnTasks() {
  test('can create task and assign it to yourself', async ({ page }) => {
    const title = uniqueTitle('new todo');
    const todo = await createTodo(page, title, 'me');

    await expect(todo.locator('label')).toHaveText(title);
  });

  test('can change own task', async ({ page }) => {
    const title = uniqueTitle('edit');
    const newTitle = `${title}_changed`;
    const todo = await createTodo(page, title, 'me');

    await todo.locator('label').dblclick();
    const editInput = editingTodoInput(page);
    await expect(editInput).toBeVisible();
    await editInput.fill(newTitle);
    await editInput.press('Enter');
    await todoByTitle(page, newTitle).locator('input.toggle').check();

    await expect(todoByTitle(page, newTitle).locator('label')).toHaveText(newTitle);
    await expect(todoByTitle(page, newTitle)).toHaveClass(/completed/);
  });

  test('can delete own task', async ({ page }) => {
    const title = uniqueTitle('todo');
    const todo = await createTodo(page, title, 'me');

    await todo.hover();
    await todo.locator('button.destroy').click();
    await expect(todoByTitle(page, title)).toHaveCount(0);
  });
}

async function createTodo(page, title, assignee) {
  await page.locator('select[name="assignee"]').selectOption({ label: assignee });
  await page.locator('input[name="title"]').fill(title);
  await page.locator('input[name="title"]').press('Enter');

  const todo = todoByTitle(page, title);
  await expect(todo).toBeVisible();
  return todo;
}

function todoByTitle(page, title) {
  return page.locator('.todo-list .todo').filter({
    has: page.locator('label', { hasText: title }),
  }).first();
}

function editingTodoInput(page) {
  return page.locator('.todo-list .todo.editing input.edit');
}

async function selectRole(page, name) {
  await page.getByRole('button', { name, exact: true }).click();
}

function uniqueTitle(prefix) {
  return `${prefix} #${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
