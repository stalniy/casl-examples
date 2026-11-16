---
{
  "id": "5db601d1b86faa19f0303104",
  "title": "Keep authorization intact when the database changes",
  "author": "admin@casl.io",
  "published": true,
  "createdAt": "2026-10-22T09:00:00.000Z",
  "updatedAt": "2026-10-22T09:00:00.000Z"
}
---
Moving a blog from MongoDB to SQL changes more than connection strings. Object identifiers become strings, relationships acquire different representations, and query builders speak a different language. The authorization policy still needs to mean the same thing to a reader.

Begin with a small contract: visitors read published articles, writers manage their own work, and administrators manage everything. Keep that contract visible while changing persistence. An ORM migration is a poor time to quietly redefine who can see a draft.

CASL's Mongo-style conditions describe the policy in these examples. The word “Mongo” in createMongoAbility does not require the application to store its data in MongoDB. The SQL example translates the effective conditions through @ucast/sql using an interpreter for the selected ORM. This requires supported operators and accurate entity metadata; an arbitrary database expression cannot be assumed to translate.

Keep the translation boundary narrow. The blog service decides which permission is required and derives a query filter. A repository accepts that filter and performs database operations. It does not need to know how a session was authenticated or which role name produced the ability. This makes the same service useful with MikroORM, TypeORM, Sequelize, Objection, and Drizzle.

Writes need the same attention as reads. Loading an article, checking permission, and updating it later leaves an interval in which the record could change. In the SQL example, updates and deletes include the service's authorization filter in the changing statement. The requested identifier narrows the target, and the permission condition narrows it again.

Check the returned data too. The browser expects an author ID and public author details under createdBy. It should receive consistent dates and identifiers whichever repository is active. Exposing the whole user record through a relation would turn a convenient author label into an unwanted disclosure.

Run the same API contract tests against each database integration. Include an owned draft, another writer's draft, a published article, and a missing record. A migration is successful when those cases retain their meaning through every supported persistence path.
