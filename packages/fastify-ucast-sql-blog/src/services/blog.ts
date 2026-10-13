import { subject, type AppAbility, type Article, type User } from '../domain.js';
import type { ArticleInput, ArticlePatch, BlogRepository, UserInput, UserPatch } from '../repositories/types.js';
import { accessFor } from './authorization.js';

export class BlogServiceError extends Error {
  constructor(readonly code: 'access_denied' | 'not_found') {
    super(code === 'access_denied' ? 'Access denied' : 'Not found');
    this.name = 'BlogServiceError';
  }
}

export class BlogService {
  constructor(private readonly repository: BlogRepository) {}

  async findLogin(email: string): Promise<User | null> {
    return this.repository.findUserByEmail(email);
  }

  async findUserForAuthentication(id: string | undefined): Promise<User | null> {
    if (!id) return null;
    return await this.repository.findUserById(id, { kind: "all" });
  }

  async findUserById(id: string, ability: AppAbility): Promise<User> {
    const user = await this.#requireUser(id);
    if (!ability.can('read', subject('User', user))) throw new BlogServiceError('access_denied');
    return user;
  }

  async createUser(input: UserInput, ability: AppAbility): Promise<User> {
    const now = new Date();
    const candidate: User = {
      ...input,
      name: input.name ?? 'Unknown',
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    if (!ability.can('create', subject('User', candidate))) throw new BlogServiceError('access_denied');
    return this.repository.createUser(candidate);
  }

  async updateUser(id: string, patch: UserPatch, ability: AppAbility): Promise<User> {
    const current = await this.findUserById(id, ability);
    const proposed = { ...current, ...patch, updatedAt: new Date() };
    if (!ability.can('update', subject('User', current))) throw new BlogServiceError('access_denied');
    if (!ability.can('update', subject('User', proposed))) throw new BlogServiceError('access_denied');

    const updated = await this.repository.updateUser(id, patch, accessFor(ability, 'update', 'User'));
    if (!updated) {
      await this.#requireUser(id);
      throw new BlogServiceError('access_denied');
    }
    if (!ability.can('read', subject('User', updated))) throw new BlogServiceError('access_denied');
    return updated;
  }

  async findArticle(id: string, ability: AppAbility): Promise<Article> {
    const article = await this.#requireArticle(id);
    if (!ability.can('read', subject('Article', article))) throw new BlogServiceError('access_denied');
    return article;
  }

  async listArticles(ability: AppAbility, page: number, pageSize: number): Promise<{ items: Article[]; count: number }> {
    const filter = accessFor(ability, 'read', 'Article');
    return this.repository.listArticles(filter, page, pageSize);
  }

  async createArticle(input: ArticleInput, authorId: string, ability: AppAbility): Promise<Article> {
    const now = new Date();
    const candidate: Article = {
      ...input,
      id: crypto.randomUUID(),
      author: authorId,
      published: Boolean(input.published),
      createdAt: now,
      updatedAt: now,
    };
    const article = subject('Article', candidate);
    if (!ability.can('create', article)) throw new BlogServiceError('access_denied');
    if (candidate.published && !ability.can('publish', article)) throw new BlogServiceError('access_denied');
    return this.repository.createArticle(candidate);
  }

  async updateArticle(id: string, patch: ArticlePatch, ability: AppAbility): Promise<Article> {
    const current = await this.#requireArticle(id);
    if (!ability.can('update', subject('Article', current))) throw new BlogServiceError('access_denied');

    const proposed = subject('Article', { ...current, ...patch });
    if (patch.published === true && !current.published && !ability.can('publish', proposed)) {
      throw new BlogServiceError('access_denied');
    }

    const updated = await this.repository.updateArticle(id, patch, accessFor(ability, 'update', 'Article'));
    if (!updated) {
      await this.#requireArticle(id);
      throw new BlogServiceError('access_denied');
    }
    return updated;
  }

  async deleteArticle(id: string, ability: AppAbility): Promise<Article> {
    const current = await this.#requireArticle(id);
    if (!ability.can('delete', subject('Article', current))) throw new BlogServiceError('access_denied');

    const deleted = await this.repository.deleteArticle(id, accessFor(ability, 'delete', 'Article'));
    if (!deleted) {
      await this.#requireArticle(id);
      throw new BlogServiceError('access_denied');
    }
    return deleted;
  }

  async #requireUser(id: string): Promise<User> {
    const user = await this.repository.findUserById(id, { kind: 'all' });
    if (!user) throw new BlogServiceError('not_found');
    return user;
  }

  async #requireArticle(id: string): Promise<Article> {
    const article = await this.repository.findArticle(id, { kind: 'all' });
    if (!article) throw new BlogServiceError('not_found');
    return article;
  }
}
