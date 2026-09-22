# Briefing — Dog Shop

**Status:** CANON for this repo's cross-tree briefs.  
**Model:** JT / Idea Factory inter-agent briefing (`docs/GREG-INTERAGENT-BRIEFING-AND-IDENTITY.md` on `jaredtimmins-code/idea-factory`), same pattern as `gdoggett-netizen/venture-factory`, `pregrade`, and `enlighten-scout`.

## The rule
Every agent owns one tree. Agents share by writing **briefs**. Git is the permanent channel. A brief that is not committed is not sent. Chat is not completion.

**Vault / CLAUDE.md still wins** for Dog Shop product, deploy, and family PWA rules. Briefing law does not override this repo's `CLAUDE.md` or vault Canon for family ops.

## Where a message goes (smallest container)

| Scope | Channel | Use when |
|---|---|---|
| Work item in dog-shop | dog-shop GitHub issue (+ comments) | meaningless detached from that issue |
| The work itself | dog-shop pull request | any file change |
| Cross-tree / another machine / an agent that does not poll this repo | `handoffs/sent/` | recipient is outside this tree |
| CoS ↔ Muse turns | `the-compound` #379 + `coo-cos-sync/handoffs/` | talking to CoS or Muse as COO/CoS, not filing dog-shop work |

Do not invent a second sync issue on this repo. The brief file is the post (same as Idea Factory / Venture Factory / pregrade / enlighten-scout).

## Lifecycle

1. Author commits `handoffs/sent/YYYY-MM-DD_<from>-to-<to>_<slug>.md` (no colons in the filename).
2. Recipient drains `handoffs/sent/` (poller or session-start). Address from `To:`, `to-<id>`, or a direct name — never from “I sent it.”
3. Recipient copies into **their own** `handoffs/received/` (Muse/CoS: `the-compound/coo-cos-sync/handoffs/received/`) with `Per: dog-shop/handoffs/sent/<file>`.
4. Then they act. Acting commits also carry `Per:`.
5. Briefs **to this tree** may be archived in this repo’s `handoffs/received/`.

`handoffs/sent/` stays as the permanent outbox. Inbox buffers (issue comments, Desktop folders) are ephemeral if used; git is the archive.

## Required headers
`From`, `To`, `Priority`, `Date`, `TL;DR`, Findings/Task, `Evidence`, `Reversible`, `Blast Radius`, `DO NOT`, `Brief Source`, `Reply Protocol`, `Requires response`, `Per`.

Drain-policy: `flag-and-hold` unless FYI (`auto-archive`). No ack-only replies. Needle Gate before minting a dog-shop issue or pinging Gregory (delta, mechanism, his touch-minutes). A brief is a message, not a capability.

## Send path
Branch + PR by default (this repo’s `CLAUDE.md`). Direct-to-`main` only if Gregory blesses `handoffs/sent/` the same way he blessed Idea Factory `--to-main`.

## Mirror to CoS (do not dump the body)
When CoS must route or decide, post a short #379 comment:

```
## Mirror — dog-shop
**TL;DR:** <one paragraph>
**Durable:** gdoggett-netizen/dog-shop/handoffs/sent/<file>.md @ <sha>
**Requires CoS:** yes/no
**Per:** dog-shop/handoffs/sent/<file>.md
```

## Identities
`To:` / `From:` resolve only through `the-compound/coo-cos-sync/identity-registry.json`. Do not invent ids.

## DO NOT
- Collapse all briefing onto #379
- Put other ventures' product code in this tree
- Create `role:*` labels without Gregory
- Put secrets (family data, tokens, Cloudflare creds) in briefs, issues, or chat
- Unpause Venture Factory capabilities from this tree
- Start GV from this tree
- Treat `.claude/HANDOFF.md` as the bus (that file is not this lane)
