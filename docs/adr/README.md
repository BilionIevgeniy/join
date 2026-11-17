# Architecture decision records

One short file per decision that shapes the structure of the code, in the [MADR](https://adr.github.io/madr/) form: context, options, the decision and its consequences. The rules that follow from a decision are in [context/architecture-rules.md](../../context/architecture-rules.md); the record says why they are the way they are.

| No. | Decision | Status |
| --- | -------- | ------ |
| [0001](0001-supabase-as-backend.md) | Supabase as the backend, no own server | accepted |
| [0002](0002-client-only-spa.md) | A client-only SPA, no SSR | accepted |

Planned records (written by the feature that makes the decision): feature structure, public API per `index.ts` and the boundary lint (5), NgRx SignalStore with `resource()` (5), workspaces and invitations (7), files in Storage (9), error monitoring (11), Signal Forms (14), the i18n library (16), realtime (17).

## How to add one

1. Copy the shape of an existing record and use the next number: `NNNN-short-title.md`.
2. Write it when a rule changes or a new one is added, before the change lands. If a rule blocks you, write a record that changes the rule; do not work around it.
3. Statuses: `proposed`, `accepted`, `superseded by NNNN`. An accepted record is not edited afterwards except for its status; a new record replaces it.
