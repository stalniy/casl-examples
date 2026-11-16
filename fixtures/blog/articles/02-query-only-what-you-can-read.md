---
{
  "id": "5db601d1b86faa19f0303102",
  "title": "Query only what you are allowed to read",
  "author": "writer@casl.io",
  "published": true,
  "createdAt": "2026-10-15T09:00:00.000Z",
  "updatedAt": "2026-10-15T09:00:00.000Z"
}
---
A journal page looks simple: fetch ten articles, display them, and offer a link to the next page. Add private drafts and that query becomes an authorization boundary. Every item, every page, and the total count must describe the same set of accessible articles.

Filtering after pagination breaks that contract. Imagine a database page containing eight drafts by other writers and two published articles. Removing the drafts in application code leaves a page of two items even when more published work exists later. An unfiltered count can also reveal the size of a collection the visitor cannot read.

Move the permission predicate into the database query before sorting and pagination. In this blog, a visitor can read published articles. A writer can also read their own articles, including drafts. The resulting condition is “published, or authored by this writer.” Apply that condition to both the list query and its count query, then order and paginate the accessible records.

The Mongoose example uses the accessibleBy integration from @casl/mongoose to derive an article filter from the ability. The SQL example derives CASL's effective rule AST and passes it through an @ucast/sql interpreter for the selected ORM. The storage mechanisms differ, but both make the database select records under the read rules.

Combine that filter with the rest of the query carefully. Searching by title should narrow the accessible set. Looking up an identifier should narrow it too. Neither operation should replace the authorization predicate. In SQL terms, the requested identifier and the permission expression belong in the same conjunction.

There is also a difference between checking a particular record and asking whether an action is possible for an article type. A type-level check cannot tell you which rows belong on a page. The query needs the conditions attached to the rules and an integration capable of translating them.

Verify this behavior with three readers: a visitor, the author of a draft, and another writer. Compare their lists and counts, then request a later page. Good authorization keeps those views consistent even as drafts and published articles are mixed throughout the database.
