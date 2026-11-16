---
{
  "id": "5db601d1b86faa19f0303101",
  "title": "Permissions are part of your domain language",
  "author": "admin@casl.io",
  "published": true,
  "createdAt": "2026-10-12T09:00:00.000Z",
  "updatedAt": "2026-10-12T09:00:00.000Z"
}
---
An authorization rule is a small statement about your product: a writer can edit an article they own. That statement deserves a name, a home, and a test. When it lives inside a route handler as a role comparison, its meaning is easy to lose.

Start with actions and resources. In this blog, Article is a resource; read, create, update, delete, and publish are actions. A role helps choose the rules for a user, but the application asks about the operation itself. The editor needs to know whether this user can update this article. It should not need a list of every role that might allow editing.

CASL expresses this with an ability. An AbilityBuilder collects rules, and createMongoAbility turns them into an object the application can query. A rule such as can('update', 'Article', { author: user.id }) connects the update action to an ownership condition. A separate read rule can allow everyone to see published articles. Together, these rules describe why a writer can read a colleague's published work while being unable to edit it.

The identifier in that condition must match the data being checked. The SQL example uses string IDs; the Mongoose example uses an ObjectId stored in author. Copying a rule between examples means checking the entity shape as well as the action name. Authorization depends on actual values, not on how similar two models look.

Keep the ability definition close to the domain vocabulary and invoke it wherever the operation happens. A route can enforce it, a query can use it to restrict results, and a view can use it to explain which controls are available. Those call sites serve different purposes, but they should agree on what “update an article” means.

Try the distinction in this example. Open a published article as a visitor, then sign in as a writer. Reading remains available. Editing depends on authorship. Sign in as the administrator and the broader manage rule becomes visible through the same interface. The product behavior changes because the rules change; the meaning of the action stays clear.
