---
{
  "id": "5db601d1b86faa19f0303105",
  "title": "Test the boundaries of a permission rule",
  "author": "writer@casl.io",
  "published": false,
  "createdAt": "2026-10-26T09:00:00.000Z",
  "updatedAt": "2026-10-27T14:30:00.000Z"
}
---
A test that proves an administrator can edit an article tells you very little about ownership. The interesting cases sit next to the allowed operation: another writer, a private draft, a changed identifier, or a request that combines an ordinary edit with a publish transition.

Start with a compact permission matrix. Use a visitor, two writers, and an administrator. Give each writer an article and vary its publication status. Now every rule has a nearby counterexample: a writer's own draft versus a colleague's draft, and a public article versus a private one.

Test the ability definition directly to make its intent easy to understand. Then exercise the API to check that the intent survives routing, authentication, subject detection, and database translation. A correct ability cannot protect a route that forgets to consult it, and a correct in-memory check does not prove that an ORM query includes the same restriction.

For a denied update, assert more than the response status. Reload the article through an authorized client and confirm that its title, body, and publication state are unchanged. For a denied delete, confirm that the record still exists. These assertions catch implementations that reject a request only after a write has already happened.

Lists need their own tests. A direct read can reject a draft while an unfiltered list still exposes it. Check both the returned items and the count, using enough records to cross a page boundary. The ordering and pagination should operate on the authorized set.

Keep missing resources separate from forbidden ones according to the API's chosen contract. These examples return 404 for a missing article and 403 for an existing article the caller cannot access. Test both paths explicitly so a repository change does not accidentally collapse them into a different behavior.

This article is deliberately a draft. A visitor should not see it in the journal. Its author can read, edit, and publish it; another writer cannot manage it; the administrator can. Before writing a test, try those cases in the example. A small, understandable fixture can make a permission boundary much easier to see.
