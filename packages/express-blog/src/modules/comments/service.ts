import type { Request, Response } from 'express';
import httpErrors from 'http-errors';
import { ForbiddenError } from '@casl/ability';
import { accessibleBy } from '@casl/mongoose';
import Comment from './model.ts';

const { NotFound } = httpErrors;

export async function findAll(req: Request, res: Response) {
  const comments = await Comment.find(accessibleBy(req.ability).ofType('Comment'));

  res.send({ items: comments });
}

export async function create(req: Request, res: Response) {
  const comment = new Comment({
    ...req.body,
    post: req.params.postId
  });

  if (req.user!._id) {
    comment.author = req.user!._id.toString();
  }

  ForbiddenError.from(req.ability).throwUnlessCan('create', comment);
  await comment.save();

  res.send({ item: comment });
}

export async function update(req: Request, res: Response) {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    throw new NotFound('Comment not found');
  }

  comment.set(req.body);
  ForbiddenError.from(req.ability).throwUnlessCan('update', comment);
  await comment.save();

  res.send({ item: comment });
}

export async function destroy(req: Request, res: Response) {
  const comment = await Comment.findById(req.params.id);

  if (comment) {
    ForbiddenError.from(req.ability).throwUnlessCan('delete', comment);
    await comment.deleteOne();
  }

  res.send({ item: comment });
}

