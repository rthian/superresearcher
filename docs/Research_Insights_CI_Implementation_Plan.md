# Research Insights & Customer Intelligence — Implementation Plan

**Role:** Head of Research Insights & Customer Intelligence  
**Scope:** Competitive Intelligence + Qualitative Research  
**Last Updated:** 2026-02-12

---

## Executive Summary

This plan adapts SuperResearcher to support your dual mandate: **competitive intelligence** and **qualitative research** across GXS and GXB. The framework evolves from the current ad-hoc state (Option A) toward a self-serve, automated insights hub (Option C), with phased rollouts and confirmation gates at each stage.

---

## Your Context (As Captured)

| Dimension | Current State | Target State |
|-----------|---------------|--------------|
| **Data Ownership** | Competitive intelligence + qualitative research | Same, with structured workflows |
| **Reporting Cadence** | Quarterly VOC reports (GXS, GXB) | Quarterly to leadership forum; monthly to product leadership |
| **Outputs** | Ad hoc | 1-page strategic brief + detailed insight backlog for execs |
| **Self-Serve** | Not yet | Pilot with smaller test group |
| **Data Ingestion** | Manual | AppStore via Appbot (CSV, monthly); NPS monthly; CSAT monthly (>1/quarter to monthly) |
| **Listening Stream** | Not yet | Later phase |
| **Close the Loop** | Not yet | Link actions to CSAT/NPS outcomes; prove ROI |
| **Competitive Landscape** | New, scattered | Living framework for features, pricing, perception |
| **Option** | A (current) | C (aspiration) |

---

## Phase Overview

| Phase | Focus | Duration | Status |
|-------|-------|----------|--------|
| **Phase 1** | Data ingestion & project structure | 4-6 weeks | Done |
| **Phase 2** | Reporting templates & cadence | 3-4 weeks | Done |
| **Phase 3** | Competitive intelligence framework | 4-6 weeks | Done |
| **Phase 4** | Close-the-loop & ROI tracking | 4-6 weeks | Done |
| **Phase 5** | Self-serve pilot & scaling | 6-8 weeks | Done |

---

# Phase 1: Data Ingestion & Project Structure -- Done

**Goal:** Establish reliable, repeatable ingestion for AppStore, NPS, and CSAT.

**Reference:** `docs/Phase1_Data_Source_Configuration.md`

- [x] Appbot format documented (Markdown review blocks)
- [x] NPS/CSAT column mapping (GXB GX Account Survey)
- [x] Naming convention: `<type>-<source>-<company>`
- [x] Project `voc-appstore-gxb` created
- [x] Transform template: `templates/gxb-survey-to-csat-mapping.csv`

---

# Phase 2: Reporting Templates & Cadence -- Done

**Goal:** Standardize outputs for leadership (1-page strategic brief) and product (insight backlog).

- [x] Strategic brief template: `templates/reports/strategic-brief.md`
- [x] `superresearcher report strategic-brief [period]` -- Quarterly leadership brief
- [x] `superresearcher report insight-backlog [period]` -- Monthly product backlog
- [x] Output: `shared/reports/strategic-brief-{period}.md` and `insight-backlog-{period}.md`

**Reference:** `docs/Phase2_Reporting_Guide.md`

---

# Phase 3: Competitive Intelligence Framework -- Done

**Goal:** Living competitive landscape: features, pricing, perception.

**Data model:** `shared/competitive/` (competitors, features, pricing, perception, release-log JSONs)

**Competitors:** Maybank, CIMB, Touch n Go, Boost (MY); DBS, OCBC, UOB, Trust Bank, MariBank (SG)
**Categories:** savings, payments, lending, cards, rewards, onboarding, investments, insurance, ux, support

CLI commands:
- `superresearcher competitive list`
- `superresearcher competitive add-feature --name <name> --category <cat> --competitor <id> --status <status>`
- `superresearcher competitive add-pricing --competitor <id> --product <prod> --previous <val> --current <val>`
- `superresearcher competitive add-release --competitor <id> --feature <feat> --category <cat> --impact <level>`
- `superresearcher competitive add-perception --competitor <id> --theme <theme> --sentiment <pos/neg/mixed>`
- `superresearcher competitive summary [period]`

Strategic brief auto-populates: feature gaps, competitor releases, pricing changes.

---

# Phase 4: Close-the-Loop & ROI Tracking -- Done

**Goal:** Measure impact of actions on CSAT and NPS to prove ROI.

**Data model:** `shared/roi-tracking.json` -- Links actions to CSAT/NPS before/after metrics.

CLI commands:
- `superresearcher roi track --action-id <id> --project <slug> --period <period> --organization <org>`
- `superresearcher roi status` -- Show all tracked actions with metric deltas
- `superresearcher roi report [period]` -- Generate full ROI report
- `superresearcher report roi [period]` -- Also works via report command

API endpoints:
- `GET /api/roi` -- All tracked actions
- `POST /api/roi/track` -- Link action to period
- `DELETE /api/roi/:actionId` -- Remove tracking
- `GET /api/roi/summary` -- Aggregate impact

Output: `shared/reports/roi-report-{period}.md`

---

# Phase 5: Self-Serve Pilot & Scaling -- Done

**Goal:** Enable a pilot group to access insights without going through you; prepare for broader rollout.

## 5.1 Pilot Scope

- **Who:** Smaller test group (e.g. product managers, design leads)
- **What:** Read-only access to insights, actions, CSAT dashboard
- **How:** SuperResearcher UI; optional Notion sync

## 5.2 Self-Serve Features

| Feature | Pilot | Full Scale |
|---------|-------|------------|
| Browse insights by project/source | Yes | Yes |
| Filter by product, impact, tag | Yes | Yes |
| View action status | Yes | Yes |
| CSAT/NPS dashboard | Yes | Yes |
| Upload data | No (you) | Role-based |
| Edit insights/actions | No | Role-based |
| Export reports | Yes | Yes |

## 5.3 Deliverables -- Done (2026-02-12)

- [x] **Token-based access control** -- `server/middleware/auth.js` (admin + viewer roles)
- [x] **Read-only viewer mode** -- Viewer token blocks write operations
- [x] **Onboarding guide** -- `docs/Phase5_Pilot_Onboarding_Guide.md`
- [x] **Competitive Intel page** -- `ui/src/pages/CompetitiveIntel.jsx` (feature matrix, pricing, releases, perception)
- [x] **ROI Tracker page** -- `ui/src/pages/ROITracker.jsx` (tracked actions, CSAT/NPS deltas)
- [x] **API endpoints** -- `/api/competitive/*`, `/api/roi/*`, `/api/auth/role`
- [x] **Sidebar updated** -- ROI Tracker + Competitive Intel added to navigation
- [x] **.env config** -- `AUTH_MODE`, `AUTH_ADMIN_TOKEN`, `AUTH_VIEWER_TOKEN`

**To enable pilot access:**
1. Set `AUTH_MODE=token` in `.env`
2. Set `AUTH_ADMIN_TOKEN` and `AUTH_VIEWER_TOKEN`
3. Share viewer token with pilot group

---

## Implementation Order

```
Phase 1 (Data) -> Phase 2 (Reporting) -> Phase 3 (Competitive) -> Phase 4 (ROI) -> Phase 5 (Self-Serve)
     |                   |                      |                      |                   |
     Done                Done                   Done                   Done                Done
```
