# Phase 2: Reporting Guide

**Status:** Completed (2026-02-10)

---

## Commands

### Strategic Brief (Quarterly — Leadership Forum)

```bash
superresearcher report strategic-brief
# Or with specific period:
superresearcher report strategic-brief 2026-Q1
```

**Output:** `shared/reports/strategic-brief-2026-Q1.md`

**Contents:**
- Executive summary (fill in)
- Top 5 strategic insights (auto-populated from projects)
- CSAT/NPS headline (from `shared/csat-metrics.json` if available)
- Competitive moves (fill in)
- Top 3 recommended actions (auto-populated)
- Ask / decision needed (fill in)

**Usage:** Review, fill placeholders marked `[Fill in]`, then export to PDF or PPT.

---

### Insight Backlog (Monthly — Product Leadership)

```bash
superresearcher report insight-backlog
# Or with specific period:
superresearcher report insight-backlog 2026-01
```

**Output:** `shared/reports/insight-backlog-2026-Q1.md`

**Contents:**
- Overview (total insights, high impact count, linked actions)
- Insights by product area
- Insights by project
- Action status summary
- Recent insights (top 10)

**Usage:** Share directly with product leadership for monthly review.

---

## Cadence

| Report | Frequency | Command |
|--------|-----------|---------|
| Strategic brief | Quarterly | `superresearcher report strategic-brief` |
| Insight backlog | Monthly | `superresearcher report insight-backlog` |

---

## Customization

Edit templates in `templates/reports/`:
- `strategic-brief.md` — Layout and sections for leadership brief
- `insight-backlog-template.md` — Reference only; insight backlog is generated programmatically
