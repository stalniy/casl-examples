import type { ErrorRequestHandler } from 'express';
import { ForbiddenError } from '@casl/ability';
import httpErrors from 'http-errors';

const { HttpError } = httpErrors;

type AppError = Error & {
  status?: number;
  errors?: unknown;
  toJSON?: () => Record<string, unknown>;
};

function toJSON(error: AppError, withStack: boolean) {
  const { stack, ...object } = error.toJSON?.()
    ?? { message: error.message, stack: error.stack };

  if (withStack) {
    object.stack = stack;
  }

  return object;
}

const errorHandler: ErrorRequestHandler = (error: AppError, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ForbiddenError) {
    res.status(403).send({ status: 'forbidden', message: error.message });
    return;
  }

  let statusCode = error.status ?? (error instanceof HttpError ? error.statusCode : 500);
  console.error(error);

  if (error.errors) {
    statusCode = 400;
  }

  res.status(statusCode).send(toJSON(error, req.app.get('env') === 'development'));
};

export default errorHandler;
