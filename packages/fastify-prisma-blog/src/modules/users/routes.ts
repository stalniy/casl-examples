import { subject } from "@casl/ability";
import { User } from "@prisma/client";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { FromSchema } from "json-schema-to-ts";

export const usersRoutes: FastifyPluginAsync = async (fastify) => {
  defineUserCreateRoute(fastify);
  defineUserUpdateRoute(fastify);
  defineUserFindRoute(fastify);
}

function defineUserFindRoute(fastify: FastifyInstance) {
  fastify.get<{ Params: { id: string } }>('/users/:id', async function (req, reply) {
    const user = await this.prisma.user.findFirst({
      where: { id: req.params.id }
    });
    if (!user) return reply.code(404).send();

    if (!req.userAbility.can('read', subject('User', user))) {
      return reply.code(403).send();
    }

    return reply.send({ item: user });
  });
}

function defineUserUpdateRoute(fastify: FastifyInstance) {
  const schema = {
    body: {
      type: "object",
      additionalProperties: false,
      properties: {
        name: { type: "string" },
        email: { type: "string", minLength: 5 },
        password: { type: "string", minLength: 6 },
      }
    }
  } as const;
  fastify.patch<{
    Body: FromSchema<typeof schema.body>;
    Params: { id: string }
  }>('/users/:id', { schema }, async function (req, reply) {
    const user = await this.prisma.user.findFirst({
      where: { id: req.params.id }
    });
    if (!user) return reply.code(404).send();

    Object.assign(user, req.body);
    user.updatedAt = new Date();
    if (!req.userAbility.can('update', subject('User', user))) {
      return reply.code(403).send();
    }

    return reply.send({ item: user });
  });
}

function defineUserCreateRoute(fastify: FastifyInstance) {
  const schema = {
    body: {
      type: "object",
      additionalProperties: false,
      required: ["email", "password", "role"],
      properties: {
        name: { type: "string" },
        email: { type: "string", minLength: 5 },
        password: { type: "string", minLength: 6 },
        role: { type: "string", enum: ["admin", "writer"] }
      }
    }
  } as const;
  fastify.post<{
    Body: FromSchema<typeof schema.body>;
    Params: { id: string }
  }>('/users', { schema }, async function (req, reply) {
    const newUser: Omit<User, 'id'> = {
      name: 'Unknown',
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    if (!req.userAbility.can('create', subject('User', newUser as User))) {
      return reply.code(403).send();
    }

    const user = await this.prisma.user.create({
      data: newUser,
    });

    return reply.code(201).send({ item: user });
  });
}
