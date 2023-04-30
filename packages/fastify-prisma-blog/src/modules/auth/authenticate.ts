import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { User } from '@prisma/client';
import { AppAbility, defineAbilityFor } from "./abilities";
import { generateToken, verifyToken } from "./services";

const TOKEN_PREFIX = 'Bearer';
export async function authenticate(this: FastifyInstance, req: FastifyRequest, reply: FastifyReply) {
    let token = req.headers.authorization || await generateToken(this.appConfig);
    if (token.startsWith('Bearer')) token = token.slice(TOKEN_PREFIX.length + 1);

    const payload = await verifyToken(this.appConfig, token);

    if ('anonymous' in payload) {
        req.userAbility = defineAbilityFor(undefined);
        req.user = {
            id: '<anonymous>',
            name: 'Anonymous',
            email: 'anonymous@casl.io',
            password: '123456',
            createdAt: new Date(),
            updatedAt: new Date(),
            role: '',
        } as unknown as User;
    } else {
        const user = await this.prisma.user.findFirst({
            where: { id: payload.id }
        });
        if (!user) return reply.code(401).send();
        req.user = user;
        req.userAbility = defineAbilityFor(user);
    }
}

export function provideAuthentication(fastify: FastifyInstance) {
    fastify.decorateRequest('user', null);
    fastify.decorateRequest('userAbility', null);
    return authenticate;
}

declare module 'fastify' {
    export interface FastifyRequest {
        user?: User;
        userAbility: AppAbility;
    }
}
