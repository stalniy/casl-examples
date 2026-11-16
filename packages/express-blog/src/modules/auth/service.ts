import type { Request, Response } from 'express';
import User from '../users/model.ts';
import httpErrors from 'http-errors';
import jwt from 'jsonwebtoken';
import { defineRulesFor } from './abilities.ts';

const { BadRequest } = httpErrors;

export async function create(req: Request, res: Response) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    throw new BadRequest('Please specify "email" and "password" fields in body');
  }

  const user = await User.findOne({ email });

  if (!user || !user.isValidPassword(password)) {
    throw new BadRequest('Invalid login or password');
  }

  // TODO: make async sign
  const token = jwt.sign({ id: user.id }, req.app.get('jwt.secret'), {
    issuer: req.app.get('jwt.issuer'),
    audience: req.app.get('jwt.audience')
  });

  res.send({
    token,
    rules: defineRulesFor(user),
    email: user.email,
    userId: user.id,
  });
}

