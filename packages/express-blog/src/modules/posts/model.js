const mongoose = require('mongoose');

const { Schema } = mongoose;

module.exports = function () {
  const Article = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    published: { type: Boolean, default: false }
  }, {
    timestamps: true,
  });

  Article.virtual('createdBy', {
    ref: 'User',
    localField: 'author',
    foreignField: '_id',
    justOne: true,
  });

  return mongoose.model('Article', Article);
};
