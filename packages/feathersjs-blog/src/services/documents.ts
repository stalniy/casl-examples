import { ForbiddenError } from '@casl/ability';
import { accessibleBy } from '@casl/mongoose';
import { BadRequest, NotFound } from '@feathersjs/errors';
import type { Id, NullableId } from '@feathersjs/feathers';
import type { Model } from 'mongoose';
import { defineAbilityFor, type Action } from '../abilities.ts';
import type { BlogRecord } from '../models/index.ts';
import type { DocumentParams } from '../types.ts';

export class DocumentService<T extends BlogRecord> {
  readonly Model: Model<T>;
  readonly subjectType: 'User' | 'Article' | 'Comment';

  constructor(Model: Model<T>) {
    this.Model = Model;
    const subjectType = Model.modelName;
    if (subjectType !== 'User' && subjectType !== 'Article' && subjectType !== 'Comment') {
      throw new Error('Unsupported document model');
    }
    this.subjectType = subjectType;
  }

  async find({ user, query = {} }: DocumentParams = {}) {
    const page = Math.max(parseInt(typeof query.page === 'string' ? query.page : '', 10) || 1, 1);
    const pageSize = Math.max(parseInt(typeof query.pageSize === 'string' ? query.pageSize : '', 10) || 100, 100);
    const countRecordsQuery = this.accessibleRecordsQuery(user);
    let recordsQuery = countRecordsQuery
      .clone()
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    if (this.subjectType === 'Article') recordsQuery = recordsQuery.populate('createdBy', 'email');
    const [items, count] = await Promise.all([
      recordsQuery,
      countRecordsQuery.countDocuments()
    ]);
    return { items, count };
  }

  async get(id: Id, { user }: DocumentParams = {}) {
    const document = await this.findDocument(id);
    this.authorize(user, 'read', document);
    return { item: document };
  }

  async create(data: Record<string, unknown>, { user }: DocumentParams = {}) {
    this.validateData(data);
    const body = { ...data };
    if (this.subjectType === 'Article' || this.subjectType === 'Comment') {
      body.author = user?._id;
    }
    const published = body.published;
    if (this.subjectType === 'Article') delete body.published;
    const document = new this.Model(body);

    this.authorize(user, 'create', document);
    if (this.subjectType === 'Article' && published) {
      this.authorize(user, 'publish', document);
      document.set('published', published);
    }
    await document.save();
    return { item: document };
  }

  async patch(id: NullableId, data: Record<string, unknown>, { user }: DocumentParams = {}) {
    const document = await this.findDocument(id);
    this.authorize(user, 'update', document);
    this.validateData(data);
    // Identity and ownership are assigned by the server. Role updates follow
    // the Express API, which also discards role from user patches.
    const { _id, id: ignoredId, author, role, createdAt, updatedAt, __v, ...body } = data;
    if (this.subjectType === 'Article' && body.published) {
      this.authorize(user, 'publish', document);
    }
    document.set(body);
    this.authorize(user, 'update', document);
    await document.save();
    return { item: document };
  }

  async remove(id: NullableId, { user }: DocumentParams = {}) {
    const document = await this.findDocument(id);
    this.authorize(user, 'delete', document);
    await document.deleteOne();
    return { item: document };
  }

  private accessibleRecordsQuery(user: DocumentParams['user']) {
    const ability = defineAbilityFor(user);
    return this.Model.find(accessibleBy(ability).ofType(this.subjectType));
  }

  private authorize(user: DocumentParams['user'], action: Action, record?: T) {
    const ability = defineAbilityFor(user);
    ForbiddenError.from(ability).throwUnlessCan(action, record ?? this.subjectType);
  }

  private async findDocument(id: NullableId) {
    if (id == null) throw new BadRequest('An id is required');
    const document = await this.Model.findById(id);
    if (!document) throw new NotFound(`${this.subjectType} not found`);
    return document;
  }

  private validateData(data: unknown) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new BadRequest('Expected an object');
    }
  }
}
