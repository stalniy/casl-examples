import { Schema } from 'mongoose';
import type { Connection, HydratedDocument, InferSchemaType } from 'mongoose';

// Keep collections, ObjectId references, timestamps and JSON virtuals compatible
// with express-blog so both APIs can use the same database and fixtures.
export function createModels(connection: Connection) {
  const user = new Schema({
    name: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'writer'] }
  }, { timestamps: true, toJSON: { virtuals: true } });

  const article = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    published: { type: Boolean, default: false }
  }, { timestamps: true, toJSON: { virtuals: true } });
  article.virtual('createdBy', {
    ref: 'User', localField: 'author', foreignField: '_id', justOne: true
  });

  const comment = new Schema({
    author: { type: String, required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    text: { type: String, required: true }
  }, { timestamps: true, toJSON: { virtuals: true } });

  return {
    User: connection.model('User', user),
    Article: connection.model('Article', article),
    Comment: connection.model('Comment', comment)
  };
}

export type Models = ReturnType<typeof createModels>;
export type UserRecord = InferSchemaType<Models['User']['schema']>;
export type UserDocument = HydratedDocument<UserRecord>;
export type ArticleRecord = InferSchemaType<Models['Article']['schema']>;
export type CommentRecord = InferSchemaType<Models['Comment']['schema']>;
export type BlogRecord = UserRecord | ArticleRecord | CommentRecord;
