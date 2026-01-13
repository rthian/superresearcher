# VoC Figma Research Reporting Format

**Category:** Improvement Areas  
**System:** SuperResearcher  
**Purpose:** Define a standardized Figma layout system for presenting Voice of Customer research insights clearly, consistently, and actionably.

---

## 1. Design Principles

The reporting format must be:

- Executive-readable
- Product-actionable
- Visually scannable
- Evidence-traceable
- Consistent across quarters

---

## 2. Figma File Structure

```
VoC Research Reports (Figma File)
  ├── 00_Cover
  ├── 01_Executive_Summary
  ├── 02_Trend_Overview
  ├── 03_UX_Category_Deep_Dive
  ├── 04_Topic_Insights
  ├── 05_Product_Impact
  ├── 06_Verbatim_Evidence
  └── 07_Methodology
```

---

## 3. Page Layout Specifications

### 00 — Cover

Components:
- Quarter (Q1 2025)
- Platform scope (iOS, Android)
- Bank / App name
- Research owner

Purpose: Context setting

---

### 01 — Executive Summary

Layout:

| Left | Right |
|------|------|
| Key Risks | Key Opportunities |

Bottom:
- One-line product takeaway

Purpose: Leadership alignment

---

### 02 — Trend Overview

Layout:

- Line chart: Top 5 topics over quarters
- Bar chart: UX category distribution
- Bullet interpretation

Purpose: Directional understanding

---

### 03 — UX Category Deep Dive

One category per frame:

Components:
- Category definition
- Trend indicator (↑ ↓ →)
- Top topics
- Example verbatims
- Impact statement

Purpose: UX-level insight

---

### 04 — Topic Insights

Card-based layout:

Each card:
- Topic name
- Volume %
- Sentiment split
- Platform split
- Key quote

Purpose: Issue granularity

---

### 05 — Product Impact

Table layout:

| Topic | Feature | Severity | Opportunity | Recommendation |

Purpose: Product action

---

### 06 — Verbatim Evidence

Grid layout:

Each card:
- Rating
- Platform
- Topic
- Quote

Purpose: Research credibility

---

### 07 — Methodology

Content:
- Data source
- Volume
- Chunking method
- Classification method
- Limitations

Purpose: Research integrity

---

## 4. Component Library

Create reusable components:

- Trend badge (↑ ↓ →)
- Severity pill (High / Medium / Low)
- Topic chip
- UX category tag
- Quote card

---

## 5. Color System

| Element | Color |
|-------|------|
| Risk | Red |
| Opportunity | Green |
| Neutral | Grey |
| Highlight | Blue |

---

## 6. Typography

- Headline: Large, bold
- Insight: Medium
- Evidence: Small, italic

---

## 7. Claude Prompt — Figma Content Generation

```text
Convert these VoC insights into slide-ready bullet content for Figma presentation.
Limit each bullet to one sentence.
Focus on clarity and actionability.
```

---

## 8. Governance Rules

- Each insight must reference evidence
- Each recommendation must map to product impact
- Visuals must not distort data

---

## 9. Relationship to SuperResearcher

This format connects:

VoC Data → Research Insight → Product Decision → Design Action

---

## 10. Guiding Principle

> Research is only powerful when it is understood and acted upon.

---

End of document.

