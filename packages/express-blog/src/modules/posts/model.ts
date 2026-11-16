import { Schema, model } from 'mongoose';

const Article = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  published: { type: Boolean, default: false }
}, {
  toJSON: { virtuals: true },
  timestamps: true,
});

Article.virtual('createdBy', {
  ref: 'User',
  localField: 'author',
  foreignField: '_id',
  justOne: true,
});

export default model('Article', Article);
