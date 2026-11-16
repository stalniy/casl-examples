---
{
  "id": "5db601d1b86faa19f0303103",
  "title": "One policy, two responsibilities: the API and the interface",
  "author": "another.writer@casl.io",
  "published": true,
  "createdAt": "2026-10-19T09:00:00.000Z",
  "updatedAt": "2026-10-19T09:00:00.000Z"
}
---
An edit button makes a promise. When a reader sees it, the interface suggests that saving a change is available. Authorization helps the interface keep that promise, while the API decides whether a requested change can actually happen.

These responsibilities need the same policy but different enforcement. React and Vue can use CASL to decide whether to show an editing control for a loaded article. The server must check the authenticated user's ability again when the update arrives. A client can send an HTTP request without ever opening the editor.

For a conditional rule, supply the article itself to the permission check. Knowing that a writer can update some Article does not establish that they can update this particular article. Its author matters. When working with plain objects, give CASL an explicit subject type where needed so the check uses the Article rules rather than an accidental JavaScript object type.

The API must also choose the trusted values used by those rules. On creation, this blog assigns authorship from the authenticated session. Accepting an arbitrary author from the request would let a caller influence the ownership condition. Validating a form's shape and authorizing its operation solve separate problems; both belong on the server.

Publishing deserves its own check. A writer who can edit a title is not automatically entitled to every workflow transition in a larger product. This example names publish as an action, making the transition visible in the policy and in the service that applies updates. If editorial approval is added later, the rule has a clear place to evolve.

Permission information in a browser can also become stale. A role may change while a page is open, or the record may change between loading and saving. Handle a rejected save as a normal outcome: show the server's response and let the reader recover. Hiding a button cannot eliminate that possibility.

Explore the boundary by signing in as different writers. The controls should describe each writer's options, and direct requests should obey those same ownership rules. A useful interface makes permissions understandable. A reliable API makes them enforceable.
