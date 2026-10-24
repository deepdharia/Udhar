# Udhar: next closed test

This plan does not guarantee Google Play approval. The October 25 Console screenshot requests **14 more days from the review date**, with at least 12 enrolled testers. Use the Console's eligibility state, not an estimated calendar date, to decide when to apply.

Official guidance: https://support.google.com/googleplay/android-developer/answer/14151465

## What the earlier application lacked

The shared October 23 conversation proposed general descriptions of invitations, usability feedback and readiness. Those drafts did not document observed tester behaviour, specific issues, released changes or retest results. We cannot confirm which draft was submitted or whether this caused the rejection. The rejection screenshot does not identify a code defect.

## Before testers update

1. Back up the ledger from the currently installed app. **Do not uninstall or clear storage.**
2. Merge the reviewed fixes, run the existing signed AAB workflow, and upload the resulting versionCode 8 / 1.0.3 to the **existing closed track**. If Play Console already has a higher version code, raise the code before building.
3. Confirm the signing/upload certificate, application ID `com.deepdharia.udhar`, and that Play offers an update to existing testers. Do not replace the app or testing track.
4. Update normally from Google Play and verify that existing entries survive. A fresh install is a different test and is not evidence of update safety.
5. Check the pre-launch report and resolve blocking crash, ANR, accessibility and device-compatibility issues. An automated browser pass is not an Android device pass.

## Participation

Keep at least 12 testers continuously opted in throughout the required additional period. A buffer of 15–20 reliable testers is useful. Ask for meaningful use and specific feedback throughout the period. The official linked guidance does not prescribe a daily number of minutes or require daily app opens. Do not invent engagement or buy empty installations.

## Suggested schedule (a plan, not completed evidence)

| Period | Tasks | Record |
|---|---|---|
| Days 1–3 | Update over the old app, enter lending and borrowing, reopen, test offline | Update/data-retention results and balances |
| Days 4–6 | Edit, delete, cancel, decimal amounts, settle review, search and activity | Expected versus actual results |
| Days 7–9 | Backup/restore with sample data; share snapshots on another device | Restore equality and share results |
| Days 10–12 | Keyboard, Android Back, rotation, small screens, privacy/help | Phone/OS details and reproducible issues |
| Days 13–14 | Retest fixes, run normal ledger tasks, review pre-launch findings | Remaining issues and readiness decision |

Use at least one Android 7/API 24–25 device or emulator, a current Android 15/16 device, and another representative phone where possible. Include gesture navigation, three-button navigation and keyboard visibility. Do not call these checks passed until someone performs them.

## Feedback record

Keep this privately; never commit tester email addresses or financial records to the public repository.

| Date | Tester alias | App version | Phone / Android | Task | Expected | Actual | Issue | Fix version | Retest result |
|---|---|---|---|---|---|---|---|---|---|
| Fill after actual testing | | | | | | | | | |

Record specific positive feedback too. Google Play private testing feedback and an existing private tester chat are suitable channels. Public GitHub issues should use sample data only. The app's Settings → Help & testing page gives testers a short task list and feedback instructions.

## Before the next application

- Check tester eligibility and additional test duration in Console.
- Confirm the build tested is the build being described.
- Review real feedback and the fix/retest record; resolve critical data-loss/crash issues.
- Verify the public privacy URL **actually shows this app's policy without login**. The repo previously named `https://glaral.com/udhar/privacy.html`; the standalone host has `https://udhar-dun.vercel.app/privacy.html`. Check the live deployment and the URL entered in Console; repository content alone cannot prove public availability.
- Complete the support email, Data Safety, financial-features declaration, target audience, content rating, and listing in Console to match the actual app. This is a personal ledger, not a lending, payment-processing or banking service. Review current form questions rather than assuming a declaration category.
- Do not claim cloud sync, encryption, automatic backups, live/revocable links or permanent data safety; those features are absent.

## Application answers: use actual facts

For engagement, describe what testers **did**, rather than what they were invited to do. For feedback, state specific observations and the real collection channel. For changes, name the fixes that were actually released and retested. For readiness, give completed test results and remaining limitations. Do not label developer-discovered issues as tester feedback.

Example structure (replace all brackets using records, respecting the current Console character limit):

- Engagement: `[N] testers used [version] for [tasks]. We observed [specific usage]. [Difference from intended production use, if any].`
- Feedback: `Via [channel], testers reported [specific issue or observation]. [Frequency/device context, if recorded].`
- Changes: `Released [version] with [specific fixes]. [N] testers retested [flows] and reported [result].`
- Readiness: `Verified [completed checks] on [devices/OS]. Reviewed [pre-launch results]. Resolved [issues]; [honest remaining limitations].`

The code review and automated test results are developer evidence. They do not establish 14 days of tester engagement.
