import type { PrismaClient } from './index';

type Logger = {
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
};

export async function repairLegacyTimestamps(prisma: PrismaClient, logger: Logger) {
  await Promise.all([
    backfillCollectionTimestamps(prisma, logger, 'users'),
    backfillCollectionTimestamps(prisma, logger, 'articles'),
  ]);
}

async function backfillCollectionTimestamps(prisma: PrismaClient, logger: Logger, collection: 'users' | 'articles') {
  try {
    const result = await prisma.$runCommandRaw({
      update: collection,
      updates: [{
        q: {
          $or: [
            { createdAt: null },
            { createdAt: { $exists: false } },
            { updatedAt: null },
            { updatedAt: { $exists: false } },
          ],
        },
        u: [{
          $set: {
            createdAt: { $ifNull: ['$createdAt', '$$NOW'] },
            updatedAt: {
              $ifNull: [
                '$updatedAt',
                { $ifNull: ['$createdAt', '$$NOW'] },
              ],
            },
          },
        }],
        multi: true,
      }],
    });

    const modifiedCount = typeof result.nModified === 'number'
      ? result.nModified
      : typeof result.n === 'number'
        ? result.n
        : 0;

    if (modifiedCount > 0) {
      logger.info({
        collection,
        modifiedCount,
      }, 'Repaired legacy Prisma timestamp fields');
    }
  } catch (error) {
    logger.warn({
      collection,
      error,
    }, 'Failed to repair legacy Prisma timestamp fields');
  }
}
