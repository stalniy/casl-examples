import type { Request, Response } from 'express';
import httpErrors from 'http-errors';
import { ForbiddenError } from '@casl/ability';
import User from './model.ts';

const { NotFound } = httpErrors;

export async function find(req: Request, res: Response) {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFound('User is not found');
  }

  ForbiddenError.from(req.ability).throwUnlessCan('read', user);
  res.send({ item: user });
}

export async function update(req: Request, res: Response) {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFound('User is not found');
  }

  const { role, ...body } = req.body;
  user.set(body);
  ForbiddenError.from(req.ability).throwUnlessCan('update', user);
  await user.save();

  res.send({ item: user });
}

export async function create(req: Request, res: Response) {
  const user = new User(req.body);

  ForbiddenError.from(req.ability).throwUnlessCan('create', user);
  await user.save();

  res.status(201).send({ item: user });
}

