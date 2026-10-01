# Udhar — Lend & Borrow Tracker

Personal lending ledger. Big terminal-style **GAVE / GOT BACK** buttons, per-person running balances, full date-&-time-stamped history, WhatsApp nudges, one-tap settle-up, JSON backup/restore. Offline-first, no login, zero permissions in v1.

- Web app: `www/index.html` (single file, also PWA-ready via `www/manifest.webmanifest`)
- Android wrapper: Capacitor 7, package `com.deepdharia.udhar`
- Privacy policy: `www/privacy.html` → served at `https://udhar.vercel.app/privacy.html` after Vercel import

## Publish pipeline (the human steps)

1. **Create the GitHub repo** `udhar` (private is fine) — the GitHub App cannot create repos.
2. Files get pushed here (maintainer does it).
3. **Upload `.github/workflows/build-aab.yml`** manually on github.com (file: `udhar-build-aab.yml`, sent separately) — the GitHub App lacks `workflows` permission.
4. **Keystore** (on Chromebook Linux terminal — enable Linux in Settings → Developers first):
   ```
   sudo apt update && sudo apt install -y default-jdk-headless
   keytool -genkeypair -v -keystore udhar.keystore -alias udhar \
     -keyalg RSA -keysize 2048 -validity 10000
   base64 -w0 udhar.keystore   # copy the output
   ```
   ⚠️ Back up `udhar.keystore` + its passwords forever. Lose them = you can never update the app.
5. **Repo → Settings → Secrets and variables → Actions** — add 4 secrets:
   `KEYSTORE_BASE64` (output of step 4), `KEYSTORE_PASSWORD`, `KEY_ALIAS` (`udhar`), `KEY_PASSWORD`.
6. **Actions tab → Build Android AAB → Run workflow** → download the `udhar-release-aab` artifact.
7. **Play Console** ($25 one-time, identity verification): create app → upload AAB → fill listing from `PLAY_STORE_LISTING.md` → privacy URL → content rating → data safety (collects **no** data) → screenshots.
8. **Closed test first**: new personal accounts must run a 14-day closed test with 12+ testers (friends/family on Android) before production release.

## Notes
- v1 ships with **zero** Android permissions — no SMS features, no background anything. Fully manual, fully offline.
- Monetization hooks: AdMob/InMobi mediation + one-time Pro — deferred to post-launch.
