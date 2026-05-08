import type { Prisma } from '@prisma/client';

import type { PrismaModel, PrismaQueryFactory, PrismaTypes } from '@casl/prisma/runtime';

export type * from '@casl/prisma/runtime';
export { accessibleBy, ParsingQueryError, prismaQuery, createPrismaAbility, createCaslExtension } from '@casl/prisma/runtime';
export type WhereInput<TModelName extends Prisma.ModelName> =
  PrismaTypes<Prisma.TypeMap>['WhereInput'][TModelName];
export type PrismaQuery<T extends PrismaModel = PrismaModel> =
  PrismaQueryFactory<Prisma.TypeMap, T>;
