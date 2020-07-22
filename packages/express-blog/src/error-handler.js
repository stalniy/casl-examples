const { ForbiddenError } = require('@casl/ability');
const { HttpError } = require('http-errors');

function toJSON(err, options = {}) {
  const { stack, ...object } = typeof err.toJSON === 'function'
    ? err.toJSON()
    : { message: err.message, stack: err.stack };

  if (options.withStack) {
    object.stack = stack;
  }

  return object;
}

module.exports = function errorHandler(error, req, res, next) { // eslint-disable-line
  if (error instanceof ForbiddenError) {
    return res.status(403).send({
      status: 'forbidden',
      message: error.message
    });
  }

  let statusCode;

  if (error.status) {
    statusCode = error.status;
  } else {
    statusCode = error instanceof HttpError ? error.statusCode : 500;
  }


  if (error.errors) {
    statusCode = 400;
  }

  res.status(statusCode).send(toJSON(error, {
    withStack: req.app.get('env') === 'development'
  }));
};
