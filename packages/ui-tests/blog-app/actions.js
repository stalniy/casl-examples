const { expect } = require('@playwright/test');

const API_URL = process.env.PLAYWRIGHT_BLOG_API_URL || 'http://127.0.0.1:3000/api';
const DEFAULT_PASSWORD = '123456';
const DEFAULT_ARTICLE_BODY = 'Default';

async function openLogin(page) {
  await page.goto('/login');
}

async function submitLogin(page, email, password = DEFAULT_PASSWORD) {
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('[name=login]').click();
}

async function login(page, email, password = DEFAULT_PASSWORD) {
  await openLogin(page);
  await submitLogin(page, email, password);
  await page.waitForURL((url) => url.pathname === '/');
  await expect(page.locator('#user-email')).toHaveText(email);
}

async function logout(page) {
  await page.goto('/');
  const logoutButton = await openHeaderAction(page, '#logout');

  if (await logoutButton.count()) {
    await logoutButton.click();
    await expect(page.locator('#user-email')).toHaveCount(0);
    await expect(page.locator('[name="goToLogin"]')).toBeVisible();
  }
}

function articleTitleLink(page, title) {
  return page.locator('.article .article-title, .article h3', { hasText: title }).first();
}

function articleCard(page, title) {
  return page.locator('.article').filter({
    has: page.locator('h3, .article-title', { hasText: title }),
  }).first();
}

async function createArticle(page, article) {
  const nextArticle = {
    published: true,
    body: DEFAULT_ARTICLE_BODY,
    ...article,
  };

  await page.goto('/');
  const createArticleButton = await openHeaderAction(page, '#create-article');
  await expect(createArticleButton).toBeVisible();
  await Promise.all([
    page.waitForURL((url) => url.pathname === '/articles/new'),
    createArticleButton.click(),
  ]);

  await fillArticleForm(page, nextArticle);
  await Promise.all([
    page.waitForURL((url) => url.pathname === '/'),
    page.locator('[name=save]').click(),
  ]);
  await expect(articleTitleLink(page, nextArticle.title)).toBeVisible();
}

async function updateArticle(page, article, changes) {
  await page.goto('/');
  const currentCard = articleCard(page, article.title);

  await expect(currentCard).toBeVisible();
  await Promise.all([
    page.waitForURL((url) => /\/articles\/[^/]+\/edit$/.test(url.pathname)),
    currentCard.locator('[name=edit]').click(),
  ]);

  await waitForExistingArticleForm(page, article);
  await fillArticleForm(page, changes);
  await Promise.all([
    page.waitForURL((url) => url.pathname === '/'),
    page.locator('[name=save]').click(),
  ]);
}

async function deleteArticle(page, article) {
  await page.goto('/');
  const currentCard = articleCard(page, article.title);

  await expect(currentCard).toBeVisible();
  await currentCard.locator('[name=delete]').click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.locator('[name=confirm]').click();
  await expect(articleCard(page, article.title)).toHaveCount(0);
}

async function fillArticleForm(page, article) {
  if (article.title !== undefined) {
    await page.locator('input[name="title"]').fill(article.title);
  }

  if (article.body !== undefined) {
    await page.locator('textarea[name="content"]').fill(article.body);
  }

  if (article.published !== undefined) {
    await page.getByLabel(/publish/i).setChecked(article.published);
  }
}

async function waitForExistingArticleForm(page, article) {
  await expect(page.locator('input[name="title"]')).toHaveValue(article.title);

  if (article.body !== undefined) {
    await expect(page.locator('textarea[name="content"]')).toHaveValue(article.body);
  }
}

async function openHeaderAction(page, selector) {
  const action = page.locator(selector);

  const isVisible = await action.isVisible().catch(() => false);

  if (!isVisible) {
    const menuButton = page.locator('.app-header [name="menu"]');

    if (await menuButton.isVisible().catch(() => false)) {
      await menuButton.click();
    }
  }

  await action.waitFor({ state: 'visible' });
  return action;
}

async function ensureHasArticle(email, article) {
  const session = await createSession(email);
  const existingArticle = await findArticleByTitle(session, article.title);

  if (existingArticle) {
    return existingArticle;
  }

  return createArticleViaApi(session, article);
}

async function createArticleViaApi(emailOrSession, article) {
  const session = await toSession(emailOrSession);
  const payload = {
    title: article.title,
    body: article.body || DEFAULT_ARTICLE_BODY,
    published: article.published ?? true,
  };
  const response = await requestJson('/articles', {
    method: 'POST',
    token: session.token,
    data: payload,
  });

  return response.item;
}

async function findArticleByTitle(emailOrSession, title) {
  const session = await toSession(emailOrSession);
  const response = await requestJson('/articles?pageSize=500', {
    token: session.token,
  });

  return response.items.find((article) => {
    const ownsArticle = article.author === session.userId
      || article.createdBy?.email === session.email;

    return ownsArticle && article.title === title;
  }) || null;
}

async function createSession(email, password = DEFAULT_PASSWORD) {
  return requestJson('/session', {
    method: 'POST',
    data: { email, password },
  });
}

async function toSession(emailOrSession) {
  if (typeof emailOrSession === 'string') {
    return createSession(emailOrSession);
  }

  return emailOrSession;
}

async function requestJson(pathname, { method = 'GET', token, data } = {}) {
  const response = await fetch(`${API_URL}${pathname}`, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: token } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`${method} ${pathname} failed with ${response.status}: ${JSON.stringify(body)}`);
  }

  return body;
}

module.exports = {
  articleCard,
  articleTitleLink,
  createArticle,
  createArticleViaApi,
  createSession,
  deleteArticle,
  ensureHasArticle,
  findArticleByTitle,
  login,
  logout,
  openLogin,
  submitLogin,
  updateArticle,
};
