import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { subject } from '../../domain.js';
import { PublishDeniedError, type ArticleInput, type ArticlePatch } from '../../repositories/types.js';

const articleBody = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'body'],
  properties: {
    title: { type: 'string' },
    body: { type: 'string' },
    published: { type: 'boolean', default: false },
  },
} as const;
const articlePatch = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string' },
    body: { type: 'string' },
    published: { type: 'boolean' },
  },
} as const;

export const articlesRoutes: FastifyPluginAsync = async (fastify) => {
  defineFindAllArticles(fastify);
  defineFindOneArticles(fastify);
  defineCreateArticles(fastify);
  defineUpdateArticles(fastify);
  defineDeleteArticles(fastify);
};

function defineFindAllArticles(fastify: FastifyInstance) {
  const { repository } = fastify;
  fastify.get<{ Querystring: { page: number; pageSize: number } }>('/articles', {
    schema: {
      querystring: {
        type: 'object',
        required: ['page', 'pageSize'],
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          pageSize: { type: 'integer', minimum: 5, maximum: 100, default: 100 },
        },
      },
    },
  }, async (req) => {
    return repository.listArticles(req.userAbility, req.query.page, req.query.pageSize);
  });
}

function defineFindOneArticles(fastify: FastifyInstance) {
  const { repository } = fastify;
  fastify.get<{ Params: { id: string } }>('/articles/:id', async (req, reply) => {
    const item = await repository.findArticle(req.params.id, req.userAbility);
    return item ? { item } : reply.code(await repository.articleExists(req.params.id) ? 403 : 404).send();
  });
}

function defineCreateArticles(fastify: FastifyInstance) {
  const { repository } = fastify;
  fastify.post<{ Body: ArticleInput }>('/articles', { schema: { body: articleBody } }, async (req, reply) => {
    const now = new Date();
    const candidate = {
      ...req.body,
      published: !!req.body.published,
      id: crypto.randomUUID(),
      author: req.user.id,
      createdAt: now,
      updatedAt: now,
    };
    if (!req.userAbility.can('create', subject('Article', candidate))) return reply.code(403).send();
    if (candidate.published && !req.userAbility.can('publish', subject('Article', candidate))) return reply.code(403).send();
    return reply.send({ item: await repository.createArticle(candidate) });
  });
}

function defineUpdateArticles(fastify: FastifyInstance) {
  const { repository } = fastify;
  fastify.patch<{ Params: { id: string }; Body: ArticlePatch }>('/articles/:id', { schema: { body: articlePatch } }, async (req, reply) => {
    try {
      const item = await repository.updateArticle(req.params.id, req.body, req.userAbility);
      return item ? { item } : reply.code(await repository.articleExists(req.params.id) ? 403 : 404).send();
    } catch (error) {
      if (error instanceof PublishDeniedError) return reply.code(403).send();
      throw error;
    }
  });
}

function defineDeleteArticles(fastify: FastifyInstance) {
  const { repository } = fastify;
  fastify.delete<{ Params: { id: string } }>('/articles/:id', async (req, reply) => {
    const item = await repository.deleteArticle(req.params.id, req.userAbility);
    return item ? { item } : reply.code(await repository.articleExists(req.params.id) ? 403 : 404).send();
  });
}
