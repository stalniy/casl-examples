# CASL hello world

Play around with [CASL](https://casl.js.org) using a simple policy: you can read all posts and edit the title and body of your own drafts. Published posts cannot be edited, and authorship stays protected.

## Run

Use Node.js 24 or newer. From this directory, run:

```sh
npm install
npm start
```

The output shows how the same permission checks produce different results for each post:

| Post | Read | Edit title | Change author |
| --- | --- | --- | --- |
| Your draft | true | true | false |
| Someone else’s draft | true | false | false |
| Your published post | true | false | false |

## Try it

Rules live in [src/defineAbility.ts](./src/defineAbility.ts), and post data and permission checks live in [src/index.ts](./src/index.ts).

1. Change the second post’s `authorId` to `1`. Can you edit it now?
2. Publish your draft by setting `published` to `true`. Can you still edit its title?
3. Add `authorId` to the allowed fields in `defineAbility.ts`. Which results change?

Run `npm start` after each change. The permission checks stay the same while the rules and data determine the answer.
