import type { Request, Response } from 'express';
import httpErrors from 'http-errors';
import { ForbiddenError } from '@casl/ability';
import { accessibleBy } from '@casl/mongoose';
import Article from './model.ts';
import type User from '../users/model.ts';
import { parsePagination } from '../utils/index.ts';

const { NotFound } = httpErrors;

export async function findAll(req: Request, res: Response) {
  const articlesQuery = accessibleBy(req.ability).ofType('Article');
  const [page, pageSize] = parsePagination(req.query);

  const [count, articles] = await Promise.all([
    Article.find(articlesQuery).countDocuments(),
    Article.find(articlesQuery)
      .populate<{ createdBy: InstanceType<typeof User> | null }>('createdBy', 'email')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip((page - 1) * pageSize),
  ]);
  const items = articles.map((article) => {
    const object = article.toJSON();
    object.createdBy = article.createdBy;
    return object;
  });

  res.send({ items, count });
}

export async function find(req: Request, res: Response) {
  const article = await Article.findById(req.params.id);

  if (!article) {
    throw new NotFound('article not found');
  }

  ForbiddenError.from(req.ability).throwUnlessCan('read', article);
  res.send({ item: article });
}

export async function create(req: Request, res: Response) {
  const { published, ...body } = req.body;
  const article = new Article({
    ...body,
    author: req.user!._id
  });

  ForbiddenError.from(req.ability).throwUnlessCan('create', article);

  if (published) {
    ForbiddenError.from(req.ability).throwUnlessCan('publish', article);
    article.published = published;
  }

  await article.save();

  res.send({ item: article });
}

export async function update(req: Request, res: Response) {
  const article = await Article.findById(req.params.id);

  if (!article) {
    throw new NotFound('article not found');
  }

  if (req.body.published) {
    ForbiddenError.from(req.ability).throwUnlessCan('publish', article);
  }

  article.set(req.body);
  ForbiddenError.from(req.ability).throwUnlessCan('update', article);
  await article.save();

  res.send({ item: article });
}

export async function destroy(req: Request, res: Response) {
  const article = await Article.findById(req.params.id);

  if (article) {
    ForbiddenError.from(req.ability).throwUnlessCan('delete', article);
    await article.deleteOne();
    res.send({ item: article });
  } else {
    res.status(404).end();
  }
}

