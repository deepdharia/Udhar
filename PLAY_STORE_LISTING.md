# Udhar — Play Store listing

## App name
Udhar — Lend & Borrow Tracker

## Package
`com.deepdharia.udhar` · version 1.0.3 (versionCode 8)

## Short description (≤80 chars)
Track money you lend friends. Big buttons, zero clutter, fully offline.

## Full description
UDHAR KA HISAAB, SORTED.

Lent money to a friend and lost track of it in your Notes app? Udhar fixes that.

Udhar is a dead-simple personal ledger for money you lend and get back. Two giant terminal-style buttons — GAVE and GOT BACK — to make recording straightforward. Every entry is date-and-time stamped, every person gets a running balance, and you can review and confirm a full settlement.

• Big GAVE / GOT BACK buttons — record money out and money in
• Per-person ledger with running totals and full history
• Every entry date-&-time stamped (backdate old entries too)
• Optional note on any entry — or skip it, your choice
• Nudge anyone on WhatsApp with their full balance, one tap
• Share any ledger as a read-only link — anyone with the link can view it, no app needed
• Manual backup reminders to help you keep a separate copy
• Review and confirm a settlement when a friend clears their dues
• Offline ledger — no login or account; send ledger details only when you choose to share
• Back up and restore your data as JSON

No spreadsheets. No mental math. Just Udhar.

## Category
Finance

## Content rating answers (IARC questionnaire guidance)
- No violence, no sexual content, no profanity, no gambling, no user-generated public content.
- Expected rating: **Everyone**.

## Data safety (Play Console → Data safety form)
- Does the app collect or share any user data? **No.**
- Data types collected: **None.** No analytics, advertising or developer ledger collection. Review user-initiated sharing exceptions against the current Data Safety questionnaire.
- All ledger data is stored locally on-device (localStorage). Android export copies JSON; web export downloads JSON. Optional WhatsApp and ledger-link sharing are user-directed.
- Privacy policy URL: `https://glaral.com/udhar/privacy.html`

## Permissions
v1 requests **zero** runtime permissions. No SMS features — the app is fully manual and offline.

## Store graphics needed (Deep to produce)
- App icon 512×512 PNG (vector source in `android/app/src/main/res/drawable/ic_launcher_foreground.xml`)
- Feature graphic 1024×500
- 2+ phone screenshots (min 1080px)

## Release notes — v1.0.3
Improved saved-data recovery, backup validation and save-failure handling. Fixed decimal settlement calculations and duplicate saves. Added settlement review, shared-ledger validation, accessibility improvements, and Help & testing.

Release notes describe implemented changes. Complete signed-build and real-device checks before publishing.
