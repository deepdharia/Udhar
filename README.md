# Udhar — Lend & Borrow Tracker

Personal lending ledger. Big terminal-style **GAVE / GOT BACK** buttons, per-person running balances, full date-&-time-stamped history, WhatsApp nudges, one-tap settle-up, JSON backup/restore. Offline-first, no login, no dangerous runtime permissions.

- Web app: `www/index.html` (single file, also PWA-ready via `www/manifest.webmanifest`)
- Android wrapper: Capacitor 7, package `com.deepdharia.udhar`
- Privacy policy: `www/privacy.html` → served at `https://glaral.com/udhar/privacy.html` after Vercel import

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
   ⚠️ Back up `udhar.keystore` + its passwords forever. Keep them secure. Play App Signing can allow an upload-key reset if needed.
5. **Repo → Settings → Secrets and variables → Actions** — add 4 secrets:
   `KEYSTORE_BASE64` (output of step 4), `KEYSTORE_PASSWORD`, `KEY_ALIAS` (`udhar`), `KEY_PASSWORD`.
6. **Actions tab → Build Android AAB → Run workflow** → download the `udhar-release-aab` artifact.
7. **Play Console** ($25 one-time, identity verification): create app → upload AAB → fill listing from `PLAY_STORE_LISTING.md` → privacy URL → content rating → data safety (collects **no** data) → screenshots.
8. **Closed test first**: new personal accounts must run a 14-day closed test with 12+ testers (friends/family on Android) before production release.

## Notes
- v1 has Internet access and **zero dangerous runtime** Android permissions — no SMS features, no background anything. Fully manual, fully offline.
- Monetization hooks: AdMob/InMobi mediation + one-time Pro — deferred to post-launch.

## Release 1.0.1
- versionCode 6; minSdk 24; compile/target SDK 36; AGP 8.10.1; Gradle 8.11.1; JDK 21.
- CI uses npm ci, syncs assets, runs lintRelease, builds/signs the bundle, and verifies its JAR signature.
- Canonical app: https://glaral.com/udhar/ ; policy: https://glaral.com/udhar/privacy.html .
- Keep existing Glaral DNS. Configure /udhar on its Netlify host using the rules in hosting/netlify-udhar-redirects.txt, before any SPA catch-all.
- Install and test API 24/25 and 36; verify keyboard/insets, offline ledger, settle-up, export/restore and sharing. Check the upload certificate against Play Console.
- Complete Play Console support email, content rating, financial-features declaration, Data Safety and store graphics.

The new Glaral studio serves Udhar directly at /udhar, with its product page at /projects/udhar. glaral.com has been attached to that site but its DNS verification is pending. Share links use glaral.com/udhar/share.html only when already running at the verified custom host; Android and the Vercel host keep the working Vercel share URL.


## Logo update (1.0.2 / versionCode 7)
The supplied green U-arrow artwork is used for the app header, favicon, Apple/PWA icons, Android adaptive and legacy launchers, and hosting/play-store-icon.png. Android adaptive artwork is padded to protect the U in launcher masks. Run the signed Android workflow and upload the new bundle to your chosen Play track.

Changing browser origins does not migrate localStorage. Export your ledger on the old site and restore the JSON backup at glaral.com/udhar.
