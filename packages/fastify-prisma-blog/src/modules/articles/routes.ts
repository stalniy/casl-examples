import { subject } from "@casl/ability";
import { accessibleBy } from "@casl/prisma";
import { Article } from '@prisma/client';
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { FromSchema } from "json-schema-to-ts";

export const articlesRoutes: FastifyPluginAsync = async (fastify) => {
    defineFindAllArticles(fastify);
    defineFindOneArticles(fastify);
    defineCreateArticles(fastify);
    defineUpdateArticles(fastify);
    defineDeleteArticles(fastify);
}

function defineFindAllArticles(fastify: FastifyInstance) {
  const schema = {
    querystring: {
      type: "object",
      required: ["page", "pageSize"],
      properties: {
        page: { type: "integer", minimum: 1, default: 1 },
        pageSize: { type: "integer", minimum: 5, maximum: 100, default: 100 }
      }
    }
  } as const;
  fastify.get<{
    Querystring: FromSchema<typeof schema.querystring>
  }>('/articles', { schema }, async function (req, reply) {
    const { page, pageSize } = req.query;
    const [count, items] = await Promise.all([
      this.prisma.article.count({
        where: accessibleBy(req.userAbility).Article
      }),
      this.prisma.article.findMany({
        where: accessibleBy(req.userAbility).Article,
        skip: (page - 1) * pageSize,
        take: page,
        include: {
          createdBy: {
            select: {
              id: true,
              email: true
            }
          }
        }
      }),
    ]);

    reply.send({ items, count });
  });
}

function defineFindOneArticles(fastify: FastifyInstance) {
  fastify.get<{ Params: { id: string } }>('/articles/:id', async function (req, reply) {
    const item = await this.prisma.article.findFirst({
      where: {
        id: req.params.id,
      }
    });
    if (!item) return reply.code(404).send();
    if (!req.userAbility.can('read', subject('Article', item))) return reply.code(403).send();

    reply.send({ item });
  })
}

function defineCreateArticles(fastify: FastifyInstance) {
  const schema = {
    body: {
      type: "object",
      required: ["title", "body"],
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        body: { type: "string" },
        published: { type: "boolean", default: false },
      },
    }
  } as const;
  fastify.post<{ Body: FromSchema<typeof schema.body> }>('/articles', { schema }, async function (req, reply) {
    const article: Omit<Article, 'id'> = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      author: req.user!.id,
      published: !!req.body.published,
    };

    if (!req.userAbility.can('create', subject('Article', article as Article))) {
      return reply.code(403).send();
    }

    if (article.published) {
      if (!req.userAbility.can('publish', subject('Article', article as Article))) {
        return reply.code(403).send();
      }
    }

    const item = await this.prisma.article.create({
      data: article,
    });

    reply.send({ item });
  })
}

function defineUpdateArticles(fastify: FastifyInstance) {
  const schema = {
    body: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        body: { type: "string" },
        published: { type: "boolean", default: false },
      },
    }
  } as const;
  fastify.patch<{
    Body: FromSchema<typeof schema.body>;
    Params: { id: string }
  }>('/articles/:id', async function (req, reply) {
    const article = await this.prisma.article.findFirst({
      where: {
        id: req.params.id,
      }
    });
    if (!article) return reply.code(404).send();
    if (!req.userAbility.can('update', subject('Article', article))) return reply.code(403).send();

    const updatedArticle = { ...article, ...req.body };

    if (req.body.published && !req.userAbility.can('publish', subject('Article', updatedArticle))) {
      return reply.code(403).send();
    }

    await this.prisma.article.update({
      where: { id: article.id },
      data: req.body
    });

    reply.send({ item: updatedArticle });
  });
}

function defineDeleteArticles(fastify: FastifyInstance) {
  fastify.delete<{ Params: { id: string } }>('/articles/:id', async function (req, reply) {
    const article = await this.prisma.article.findFirst({
      where: {
        id: req.params.id,
        AND: accessibleBy(req.userAbility, 'delete').Article,
      },
      select: {
        id: true
      }
    });
    if (!article) return reply.code(404).send();

    if (!article) return reply.code(403).send();

    await this.prisma.article.delete({
      where: { id: article.id }
    });

    reply.send({ item: article });
  })
}
