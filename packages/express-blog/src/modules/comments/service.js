const { NotFound } = require('http-errors');
const { ForbiddenError } = require('@casl/ability');
const { accessibleBy } = require('@casl/mongoose');
const Comment = require('./model')();

async function findAll(req, res) {
  const comments = await Comment.find(accessibleBy(req.ability).Comment);

  res.send({ items: comments });
}

async function create(req, res) {
  const comment = new Comment({
    ...req.body,
    post: req.params.postId
  });

  if (req.user._id) {
    comment.author = req.user._id;
  }

  ForbiddenError.from(req.ability).throwUnlessCan('create', comment);
  await comment.save();

  res.send({ item: comment });
}

async function update(req, res) {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    throw new NotFound('Comment not found');
  }

  comment.set(req.body);
  ForbiddenError.from(req.ability).throwUnlessCan('update', comment);
  await comment.save();

  res.send({ item: comment });
}

async function destroy(req, res) {
  const comment = await Comment.findById(req.params.id);

  if (comment) {
    ForbiddenError.from(req.ability).throwUnlessCan('delete', comment);
    await comment.remove();
  }

  res.send({ item: comment });
}

module.exports = {
  create,
  update,
  destroy,
  findAll
};
