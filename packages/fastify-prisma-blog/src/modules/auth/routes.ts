import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { FromSchema } from "json-schema-to-ts";
import { defineRulesFor } from './abilities';
import { generateToken, isValidUserPassword } from './services';

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  defineRegisterRoute(fastify);
};

function defineRegisterRoute(fastify: FastifyInstance) {
  const schema = {
    body: {
      type: "object",
      required: ["email", "password"],
      additionalProperties: false,
      properties: {
        email: { type: "string", minLength: 5 },
        password: { type: "string", minLength: 6 },
      }
    }
  } as const;

  fastify.post<{ Body: FromSchema<typeof schema.body> }>('/session', {
    schema,
  }, async function(req, reply) {
    const { email, password } = req.body;
    const user = await this.prisma.user.findFirst({ where: { email } });

    if (!user || !isValidUserPassword(user, password)) {
      return reply.code(400).send({ message: 'Invalid login or password' });
    }

    const token = await generateToken(this.appConfig, user);

    return reply.send({
      token,
      rules: defineRulesFor(user),
      email: user.email,
      userId: user.id,
    });
  });
}
