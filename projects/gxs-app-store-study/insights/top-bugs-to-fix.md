# GXS App – Top Bugs to Fix (from App Store / Play Store Reviews)

**Study:** `gxs-app-store-study`  
**Generated:** 2026-01-13  
**Source of truth:** `projects/gxs-app-store-study/insights/insights.json` (INS-004, INS-009, INS-012, INS-017, INS-020 + supporting context)

---

## Executive Summary

The highest-severity issues cluster around **onboarding blockers** (can’t register / can’t link bank) and **core reliability** (crashes / device incompatibility / payments outages). Fixing the **P0 onboarding blockers** should be treated as urgent because they directly stop new user conversion and first-time activation.

---

## P0 — Critical (Fix Immediately)

### 1) Bank linking is broken (no banks appear in dropdown)

- **Why it matters:** Blocks users from linking accounts, which blocks funding and activation.
- **Insight:** **INS-004** (Bug Report) — *Impact: High, Confidence: High*
- **Evidence (verbatim):**
  - “After an update, totally can't transfer money into the account. Tried linking bank also no option to select banks at all, no bank name showing” — Rick Peh
  - “encountered same problem with others, couldn't link bank account. wouldn't show list of banks…” — phil mu
- **Recommended fix focus:**
  - Patch the dropdown data source + error handling.
  - Add a fallback/manual bank entry path or “contact support to link” flow until fixed.

### 2) Registration hangs / users can’t sign up

- **Why it matters:** Directly blocks acquisition.
- **Insight:** **INS-012** (Bug Report) — *Impact: High, Confidence: Medium*
- **Evidence (verbatim):**
  - “Cannot register new Account, keep Said wait a Moment, try Many times still Cannot register” — yyeyyu
  - “Why cannot sign up?” — Conscientious 1111
- **Recommended fix focus:**
  - Instrument the registration funnel to pinpoint where it stalls.
  - Replace ambiguous “wait a moment” states with actionable error messaging + retry.

---

## P1 — High (Fix This Sprint)

### 3) App crashes / instability after updates

- **Why it matters:** Breaks core usage and drives churn; “post-update regression” theme appears repeatedly.
- **Insight:** **INS-009** (Bug Report) — *Impact: High, Confidence: High*
- **Evidence (verbatim):**
  - “The app keep crashing” — Shun Teo
  - “after update, can't transfer funds… Keep saying error” — Zixx
- **Recommended fix focus:**
  - Add crash + network error monitoring and alerting.
  - Strengthen regression test coverage for login + transfers + linking flows.

### 4) Android “device incompatible” (incl. Android 14 issues)

- **Why it matters:** Entire segment blocked from using the app.
- **Insight:** **INS-020** (Bug Report) — *Impact: Medium, Confidence: Medium*
- **Evidence (verbatim):**
  - “App can't be used on android 14” — Muz Monkey
  - “unusable, keep show your device is incompatible on lastest version update” — Gan Kelvin
- **Recommended fix focus:**
  - Confirm which checks are failing (integrity/device checks, OS version gating, build targets).
  - Patch quickly and add pre-release matrix testing for newest OS versions.

### 5) eGIRO outage / reliability incident lasting 7–8 days

- **Why it matters:** Payment rails outage + poor comms is a trust killer, and can directly impact users’ bill payment behavior.
- **Insight:** **INS-017** (Bug Report) — *Impact: High, Confidence: Medium*
- **Evidence (verbatim):**
  - “7 days after eGIRO service became unavailable… It has already been 8 days but the bank is sharing no info.” — Choon Hau Lua
- **Recommended fix focus:**
  - Treat as incident management + reliability: restore, harden, and communicate status clearly.
  - Add in-app status banner during outages and a public status page.

---

## P2 — Medium (Next Sprint / Planned Improvements)

### 6) Developer options enforcement creates recurring UX breakage / blocks flows

- **Why it matters:** Adds repeated friction and reports indicate it can break flows requiring 2FA.
- **Related insight:** **INS-010** (Pain Point) — *Impact: Medium, Confidence: High*
- **Evidence (verbatim):**
  - “Stop asking me to disable developer options. Other banking apps don't ask this either.” — Aditia Nugraha
- **Recommended fix focus:**
  - Reduce frequency (once per session) and avoid blocking non-sensitive actions when possible.

---

## Suggested Fix Order (If You Can Only Do 3 Things)

1. **Bank linking dropdown empty (INS-004)** — onboarding activation blocker  
2. **Registration hanging (INS-012)** — acquisition blocker  
3. **Crash / stability regressions after updates (INS-009)** — retention + trust

---

## Engineering Notes (What to Put in Place While Fixing)

- **Release safety:** Feature flags + staged rollout + rapid rollback
- **Quality gates:** Automated regression tests for “happy path” onboarding and transfers
- **Observability:** Crash reporting + key funnel instrumentation (signup → link → fund → transfer)
- **Comms:** In-app incident banners + clear error messages (no silent failures)

