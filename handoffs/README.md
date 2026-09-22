# handoffs — Dog Shop brief lane

Cross-tree messages. Same lifecycle as Idea Factory / Venture Factory / pregrade / enlighten-scout `handoffs/`.

```
handoffs/
├── README.md
├── sent/       ← briefs this tree authors (permanent outbox)
└── received/   ← briefs sent *to* this tree, archived after read (permanent)
```

1. Sender drafts in `<their-repo>/handoffs/sent/` and commits (or, for this tree, commits here).
2. Recipient reads from this `sent/` (git poll). Git commit **is** delivery.
3. Recipient archives to their own `handoffs/received/` with a `Per:` line.
4. Acting commits cite `Per: dog-shop/handoffs/sent/<file>.md`.

A brief left unconsumed is pending forever. A brief is a message, not a capability. Full law: `docs/BRIEFING.md`. Identity: `IDENTITY.md`.
