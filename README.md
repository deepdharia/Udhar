# Udhar — Lend & Borrow Tracker

An offline personal ledger for money lent and received. GAVE / GOT BACK entries, per-person balances, history, search, settlement review, WhatsApp nudges, read-only snapshot links, and manual JSON backup/restore. No account, analytics or advertising SDK.

## Current release candidate

**1.0.3 / versionCode 8** · package `com.deepdharia.udhar` · minSdk 24 · compile/target SDK 36.

This is a release candidate until the signed build and real Android testing are complete. Code changes do not guarantee Google Play production access.

- `www/` is the canonical web source.
- `android/` is the Capacitor 7 wrapper. Public assets are tracked and must match `www/`.
- `udhar-index-fixed.html` is an old standalone draft, not a release source.
- [Closed-test plan](docs/CLOSED_TEST_PLAN.md) covers the additional 14-day test, feedback records and honest application answers.
- [Review and verification](docs/READINESS_REVIEW.md) records confirmed defects, fixes and remaining checks.

## Develop and verify

Use Node 20 or newer. Android builds require JDK 21 and Android SDK 36.

```sh
npm ci
npm test
npx playwright install chromium
npm run test:e2e
npm run sync:android
npm run check:assets
```

For a local web session, run `node scripts/serve.cjs` and open `http://127.0.0.1:4173`.

For Android validation after syncing:

```sh
cd android
./gradlew lintRelease testReleaseUnitTest bundleRelease
```

On platforms where the wrapper is not executable, use `bash gradlew ...` or set its executable bit. An unsigned local AAB is not a Play upload artifact. The checked-in `Build Android AAB` GitHub Actions workflow builds/signs using the existing repository secrets (`KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`) and verifies the bundle signature. Never commit a keystore or passwords.

## Changes in 1.0.3

- Preserve unreadable saved data; never replace it with an empty ledger at startup. A recovery banner offers the original raw data for copying.
- Validate all restored people, transaction types, amounts, dates, IDs and relationships; confirm before replacement.
- Commit state only after storage succeeds. Reject writes from a stale browser tab and show save failures.
- Calculate balances in integer minor units to prevent floating-point settlement errors; accept positive amounts with at most two decimal places.
- Ignore queued duplicate saves and review settlement before recording it.
- Escape imported display data; validate shared snapshots and show both receive/pay totals from the sender's perspective.
- Add dialog close buttons, keyboard navigation/focus management, reduced-motion support, Help & testing, and a version indicator.
- Handle Android Back for sheets/views and enable Capacitor's automatic edge-to-edge margins on supported Android versions; request keyboard resize.

## Data and limitations

The existing `funds_v1` key, Android package, and Capacitor local origin are preserved. Back up before updating and test an update over the existing installed app. Do not uninstall or clear storage just to get the update.

Ledgers use localStorage, which is not a guarantee of permanent storage. Clearing browser/app storage, uninstalling, device loss or system storage cleanup can remove data. JSON backups and shared links are unencrypted. Shared links are snapshots without expiry or revocation; anyone with the full link can read and forward it. There is no cloud account or sync, loan service, payment processing or automatic financial transaction detection.

The installed Android app bundles its assets for offline operation. The website's ledger works after loading; this repository has no service worker and does not promise a cold offline website launch.

The validator supports 100,000 people/entries, backups up to 10 MiB, names up to 120 characters, notes up to 2,000 characters, and a currency symbol up to 3 UTF-16 code units. IDs remain strings; valid older records and the legacy `note` field are supported. Unsupported or corrupt saved records stay untouched for recovery. Very large ledgers may still be slow because rendering is not virtualized.

## Hosting and Play Console

The existing standalone host is `https://udhar-dun.vercel.app`. The existing custom route is `https://glaral.com/udhar/`; see `hosting/` for integration notes. Confirm the deployed privacy-policy URL and Play Console declarations before submission. Website changes do not update an already-installed Android app: testers need the new signed AAB through Google Play.

Changing browser origins does not migrate localStorage. Export on the old origin and restore on the new origin. Never change the Capacitor hostname/scheme casually.
