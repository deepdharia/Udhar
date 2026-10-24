# Udhar readiness review — 25 October 2026

Reviewed `deepdharia/Udhar` main at `86aefd4522955b0f9da42f7e31db519e1aafc33d`, plus the shared October 23 application conversation and the October 25 rejection screenshot. Changes are prepared on `fix/closed-test-readiness` as 1.0.3 / versionCode 8.

## Conclusion

The screenshot requires an additional 14 days of closed testing with at least 12 testers from the review date. It does not state that a particular code bug caused the decision. The earlier application drafts described invitations and general usability rather than specific observed engagement, feedback, changes and retest results. These were weak evidence of readiness; that is not proof of Google's reason.

There were independently verifiable code defects worth fixing before the next test. The ledger's features have been preserved, with an explicit review step added to settlement and restore for data safety.

## Findings and changes

| Priority | Finding in the reviewed main branch | Change |
|---|---|---|
| High | `load()` returned null for corrupt storage, followed by `seed()` and an unconditional `save()`: opening the app could overwrite the original raw ledger. | No startup write; validation/recovery banner; preserve and offer original raw data for copying. |
| High | Entry/edit/delete/restore/wipe mutated live state and showed success even when saving failed. | Validate and persist a candidate before replacing in-memory state; keep editors open and report failure. |
| High | Restore checked only that people/entries were arrays. Invalid IDs, unknown types, string amounts, missing people and invalid dates could break rendering or balances. | Full record validation, bounded file size, duplicate/reference checks, explicit replacement confirmation, no change on rejection. |
| High | Imported person/entry IDs were inserted in HTML attributes without escaping; currency was inserted into some HTML without escaping. | Escape all such values; test hostile imported strings. This is a code finding, not evidence anyone exploited it. |
| Medium | Floating-point sums could leave a tiny nonzero balance after decimal repayments. | Sum safe integer minor units for both the ledger and shared snapshots. |
| Medium | A rapid repeated save could create duplicate records. | Ignore save callbacks after a successful save closes the active editor. |
| Medium | Settle up scheduled an automatic write after a short timeout. | Prefill the settlement amount for explicit review and recording. |
| Medium | An old browser tab could overwrite another tab's newer ledger. | Compare the saved snapshot before writes, observe storage events, and require reload on conflicts. This is a best-effort guard, not a transactional cross-tab database. |
| Medium | Shared data validated only its top-level shape; malformed entries could crash the read-only viewer. Receive-only summary obscured pay balances. | Validate the full payload, render a safe error, show both receive and pay totals, clarify sender perspective. |
| Medium | UI navigation existed only in JavaScript; no Android Back handler for its sheets/views. SDK 36 wrapper did not configure Capacitor's available edge-to-edge margins. | Add an AndroidX Back callback, JavaScript close/home handler, automatic margins, and keyboard resize. Real-device testing remains required. |
| Medium | No usable automated tests; `npm test` intentionally exited with an error. | Core calculation/validation tests and real Chromium browser regression tests. |
| Low | Settings and action sheets lacked close buttons/focus management; many fields lacked associated labels. | Add dialog semantics, focus return/trapping, Escape, keyboard activation, labels and reduced-motion CSS. |
| Low | Public listing promised backup safety beyond what manual backups can ensure. Version text lagged the Android build. | Correct wording and update release-candidate metadata. |
| Low | The starter Android instrumentation test expected the Capacitor template package instead of Udhar. | Correct the assertion to `com.deepdharia.udhar`; execution still requires a device/emulator. |
| Low | No in-app guidance for testers or structured feedback plan. | Settings → Help & testing and a repo closed-test plan with a private feedback record template. |

## Verification

A Node VM run of the original main-branch startup script confirmed that a damaged `funds_v1` string was replaced. A second run with 0.1 + 0.2 − 0.3 returned `5.551115123125783e-17` instead of zero. The regression suite verifies the corrected behaviour.

- Core checks: **23 passed** (`npm test`). Covers older ledger shape, legacy notes, exact decimal settlement, both balance directions, invalid inputs, malformed records and JavaScript parsing.
- Browser checks: **27 passed** (`npm run test:e2e`). Covers save/reopen, lending/borrowing, search/activity, edit/delete, settlement review, double taps, storage failure, corrupt-data recovery, restore confirmation/cancellation, downloaded backup JSON, native-copy backup simulation, JavaScript Back navigation, Escape/focus, Unicode share round trip, malicious imported data, stale-tab writes, offline transactions after load, wipe and privacy return, mobile widths, currency, help, and file restore.
- Asset equality: `npm run check:assets` compares every canonical `www/` file with its packaged Android counterpart.
- Visual inspection: Chromium screenshot of the ledger at 390×844; overflow assertions at 320, 390 and 768 pixels. This does not establish Android WebView appearance or keyboard behaviour.
- Live URL check: direct HTTP GET returned 200 and the expected Udhar page titles for `https://udhar-dun.vercel.app/`, `/privacy.html`, `/share.html`, and `https://glaral.com/udhar/privacy.html`. The privacy pages contained the Udhar policy heading. These checks cover the deployment before this branch; they do not prove the new release is deployed or which URL Console contains.
- Android validation: **BUILD SUCCESSFUL** for `lintRelease testReleaseUnitTest bundleRelease` using JDK 21, Gradle 8.11.1 and SDK 36 (137 tasks). App lint: **0 errors, 11 warnings**, consisting of manifest ordering, redundant/unused resources, missing monochrome launcher icon metadata and bitmap resource placement. Capacitor retains its upstream lint baseline; no new suppression was added. The native unit-test task contains a starter arithmetic test and does not establish device coverage.
- Built AAB: all **13** canonical web assets match their packaged bytes, including `ledger-core.js` and Help & testing. The local bundle is **unsigned**, not a Play upload artifact; use the existing signed GitHub workflow. No Play Console submission has occurred.
- Corrected starter instrumentation assertion: source updated to the actual package ID; not executed on a device/emulator.

## Remaining gates

1. Produce and verify the signed AAB with the existing upload key. Do not upload a locally unsigned AAB.
2. Confirm Play Console's latest versionCode before using 8; increment if necessary. Check listing, support email, Data Safety, financial-features and other declarations against the actual app and current forms.
3. Test an update over the already installed app without uninstalling, and verify saved data remains. The storage key, application ID and Capacitor origin were not changed.
4. Test Android 7/API 24–25 and Android 15/16, gestures/buttons, keyboard, rotation, Back from local privacy/help, WhatsApp handoff, clipboard fallback, and airplane-mode cold launch. JavaScript simulations do not validate native OS handoff.
5. Review the actual Play pre-launch report and Android vitals. This environment has no authenticated Play Console connector and cannot verify those reports or the testers' opt-in history.
6. Complete genuine additional closed testing and record real feedback/retests. Developer tests cannot stand in for tester engagement.

## Limits retained deliberately

LocalStorage remains the storage mechanism for compatibility. It can be cleared by users or the system; manual backup is still essential. There is no native durable database migration, cloud sync, encryption, automatic backup or revocable sharing. A future durable native storage migration needs separate migration and update testing. Website cold offline loading is not implemented; Android bundles its assets. Very large ledgers may be slow. No crash telemetry or tester tracking has been added.

## References

- Google testing and production-access guidance: https://support.google.com/googleplay/android-developer/answer/14151465
- Android 16 edge-to-edge behaviour: https://developer.android.com/about/versions/16/behavior-changes-16
- Capacitor storage limitations: https://capacitorjs.com/docs/guides/storage
- Capacitor 7.6.9 source used to confirm `android.adjustMarginsForEdgeToEdge`: `node_modules/@capacitor/android/capacitor/src/main/java/com/getcapacitor/CapacitorWebView.java` and `CapConfig.java`.
