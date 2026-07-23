# Changelog

All notable user-visible changes to Dog Shop are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Pre-1.0 versions use `0.MINOR.PATCH` (feature → MINOR, fix → PATCH).

## [0.6.0] - 2026-05-31

### Changed
- Simplified shopping session: removed the store picker so the list is just names and items
- Welcome-back greeting when you reopen the app

## [0.5.0] - 2026-05-31

### Added
- User names — set once; shown on items you add and in comment threads
- Changelog modal (replaces the What's New banner) with per-version acknowledgement

### Fixed
- Food Lion search URL
- Store searches open in the same tab so the back button returns to the list
- List no longer jumps/bounces on background poll when nothing changed

## [0.4.1] - 2026-05-25

### Fixed
- History shows items as soon as they are marked Got (not only after Clear Got)

## [0.4.0] - 2026-05-21

### Added
- History tab — items marked Got, grouped by day
- Suggestions — items bought regularly (3+ times in 90 days) bubble up
- What's New banner — shows once per app update, tap to dismiss

## [0.3.0] - 2026-05-18

### Added
- Item notes — tap below any item name to add a comment
- Quantity field — tap the qty badge to set amount
- Comment threads per item — tap 💬 to ask questions; other people get a push notification

## [0.2.1] - 2026-05-18

### Fixed
- Web Push encryption (HKDF info strings for Web Crypto)

## [0.2.0] - 2026-05-17

### Added
- Web Push notifications when family members add items to the list
- Notification bell always visible (explains unsupported browsers on tap)

### Changed
- Visual polish pass for a more premium UI before sharing with the family

## [0.1.0] - 2026-05-16

### Added
- Initial PWA: shared family shopping list with live polling
- Cloudflare Worker API + D1 storage
- Walmart search from list items
- Installable app icons from the family dog photo
