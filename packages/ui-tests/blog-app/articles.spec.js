const { test, expect } = require('@playwright/test');
const {
  articleCard,
  articleTitleLink,
  createArticle,
  createArticleViaApi,
  deleteArticle,
  ensureHasArticle,
  login,
  updateArticle,
} = require('./actions');

const WRITER_EMAIL = 'writer@casl.io';
const ANOTHER_WRITER_EMAIL = 'another.writer@casl.io';
const ADMIN_EMAIL = 'admin@casl.io';
const publishedArticleTitle = '$published article$';
const draftArticleTitle = '$draft article$';

test.describe('Articles', () => {
  test.beforeAll(async () => {
    await ensureHasArticle(ANOTHER_WRITER_EMAIL, {
      title: publishedArticleTitle,
    });
    await ensureHasArticle(ANOTHER_WRITER_EMAIL, {
      title: draftArticleTitle,
      published: false,
    });
  });

  test.describe('when user is not logged in', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    behavesAsReader();

    test('cannot create article', async ({ page }) => {
      await expect(page.locator('#create-article')).toHaveCount(0);
    });
  });

  test.describe('when user is a writer', () => {
    test.beforeEach(async ({ page }) => {
      await login(page, WRITER_EMAIL);
    });

    behavesAsReader();
    behavesAsAuthor(WRITER_EMAIL);
  });

  test.describe('when user is an admin', () => {
    test.beforeEach(async ({ page }) => {
      await login(page, ADMIN_EMAIL);
    });

    behavesAsAuthor(ADMIN_EMAIL);

    test('can see others drafts', async ({ page }) => {
      await page.goto('/');
      await expect(articleTitleLink(page, draftArticleTitle)).toBeVisible();
    });

    test('can change others articles', async ({ page }) => {
      await page.goto('/');
      await expect(articleCard(page, publishedArticleTitle).locator('[name=edit]')).toBeVisible();
    });

    test('can delete others articles', async ({ page }) => {
      await page.goto('/');
      await expect(articleCard(page, publishedArticleTitle).locator('[name=delete]')).toBeVisible();
    });
  });
});

function behavesAsReader() {
  test('can see published articles', async ({ page }) => {
    await page.goto('/');
    await expect(articleTitleLink(page, publishedArticleTitle)).toBeVisible();
  });

  test('cannot see others drafts', async ({ page }) => {
    await page.goto('/');
    await expect(articleTitleLink(page, draftArticleTitle)).toHaveCount(0);
  });

  test('cannot delete others articles', async ({ page }) => {
    await page.goto('/');
    await expect(articleCard(page, publishedArticleTitle).locator('[name=delete]')).toHaveCount(0);
  });

  test('cannot change others articles', async ({ page }) => {
    await page.goto('/');
    await expect(articleCard(page, publishedArticleTitle).locator('[name=edit]')).toHaveCount(0);
  });
}

function behavesAsAuthor(email) {
  test('can create own article', async ({ page }) => {
    const article = { title: uniqueTitle('own article') };

    await createArticle(page, article);
    await expect(articleCard(page, article.title)).toHaveClass(/own/);
  });

  test('can update own article', async ({ page }) => {
    const article = await createArticleViaApi(email, {
      title: uniqueTitle('editable article'),
    });
    const newTitle = `UPDATED: ${article.title}`;

    await updateArticle(page, article, { title: newTitle });
    await expect(articleTitleLink(page, newTitle)).toBeVisible();
  });

  test('can delete own article', async ({ page }) => {
    const article = await createArticleViaApi(email, {
      title: uniqueTitle('deletable article'),
    });

    await deleteArticle(page, article);
    await expect(articleTitleLink(page, article.title)).toHaveCount(0);
  });

  test('can create draft article', async ({ page }) => {
    const article = {
      title: uniqueTitle('draft article'),
      published: false,
    };

    await createArticle(page, article);
    await expect(articleCard(page, article.title)).toHaveClass(/draft/);
  });

  test('can publish draft', async ({ page }) => {
    const article = await createArticleViaApi(email, {
      title: uniqueTitle('draft to publish'),
      published: false,
    });

    await updateArticle(page, article, { published: true });
    await expect(articleCard(page, article.title)).not.toHaveClass(/draft/);
  });
}

function uniqueTitle(prefix) {
  return `${prefix} ${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
