const { NotFound } = require('http-errors');
const { ForbiddenError } = require('@casl/ability');
const User = require('./model')();

async function find(req, res) {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFound('User is not found');
  }

  ForbiddenError.from(req.ability).throwUnlessCan('read', user);
  res.send({ item: user });
}

async function update(req, res) {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFound('User is not found');
  }

  user.set(req.body.user);
  ForbiddenError.from(req.ability).throwUnlessCan('update', user);
  await user.save();

  res.send({ item: user });
}

async function create(req, res) {
  const user = new User(req.body);

  ForbiddenError.from(req.ability).throwUnlessCan('create', user);
  await user.save();

  res.status(201).send({ item: user });
}

module.exports = {
  create,
  find,
  update
};
