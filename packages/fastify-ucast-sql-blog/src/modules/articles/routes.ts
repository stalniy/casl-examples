import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import type { ArticleInput, ArticlePatch } from '../../repositories/types.js';

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
  const { blogService } = fastify;
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
    return blogService.listArticles(req.userAbility, req.query.page, req.query.pageSize);
  });
}

function defineFindOneArticles(fastify: FastifyInstance) {
  const { blogService } = fastify;
  fastify.get<{ Params: { id: string } }>('/articles/:id', async (req) => {
    const item = await blogService.findArticle(req.params.id, req.userAbility);
    return { item };
  });
}

function defineCreateArticles(fastify: FastifyInstance) {
  const { blogService } = fastify;
  fastify.post<{ Body: ArticleInput }>('/articles', { schema: { body: articleBody } }, async (req) => {
    const item = await blogService.createArticle(req.body, req.user.id, req.userAbility);
    return { item };
  });
}

function defineUpdateArticles(fastify: FastifyInstance) {
  const { blogService } = fastify;
  fastify.patch<{ Params: { id: string }; Body: ArticlePatch }>('/articles/:id', { schema: { body: articlePatch } }, async (req) => {
    const item = await blogService.updateArticle(req.params.id, req.body, req.userAbility);
    return { item };
  });
}

function defineDeleteArticles(fastify: FastifyInstance) {
  const { blogService } = fastify;
  fastify.delete<{ Params: { id: string } }>('/articles/:id', async (req) => {
    const item = await blogService.deleteArticle(req.params.id, req.userAbility);
    return { item };
  });
}
