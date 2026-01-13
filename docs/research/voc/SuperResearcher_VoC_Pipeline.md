# SuperResearcher VoC Pipeline (v1)

Category: Improvement Areas  
Purpose: Establish a scalable, AI-ready Voice of Customer (VoC) processing pipeline for GXS App Store verbatims.

---

## 1. Objectives

- Preserve raw customer verbatims as an audit trail.
- Enable safe and scalable AI processing.
- Convert unstructured feedback into structured research intelligence.
- Support quarterly product, design, and leadership reporting.
- Prepare data for future vector search and trend analysis.

---

## 2. Data Scope

- Source: App Store reviews
- Bank: GXS
- Frequency: Quarterly
- Platforms: iOS, Android
- Volume: ~200 verbatims per file

---

## 3. Folder Architecture

/data/raw/gxs/
  q1_ios.md
  q1_android.md
  q2_ios.md
  q2_android.md

Rules:
- Raw files must never be edited or refactored.
- They act as the immutable source of truth.

---

## 4. Chunking Strategy

Each quarterly file (~200 verbatims) is split into chunks of ~20 verbatims.

Chunk template:

# GXS App Store Verbatims  
Bank: GXS  
Quarter: Q1 2025  
Platform: iOS  
Chunk: 01  

[1]  
Rating: 2  
Verbatim: App crashes after login...

---

## 5. Structuring Layer (JSON)

Output example:

{
  "bank": "GXS",
  "quarter": "Q1 2025",
  "platform": "iOS",
  "entries": [
    {
      "id": 1,
      "rating": 2,
      "sentiment": "negative",
      "topics": ["login", "crash"],
      "ux_category": "reliability",
      "verbatim": "App crashes after login..."
    }
  ]
}

---

## 6. Claude Prompt — Chunk to JSON

Convert these app store verbatims into structured JSON using the schema below.

Rules:
- Preserve original wording.
- Infer sentiment, topics, and UX category.
- Do not summarize.
- Return valid JSON only.

---

## 7. Insight Extraction

Extract:
- Top complaint themes
- Delight themes
- Risk signals
- UX opportunities

---

## 8. Reporting

Write quarterly VoC summaries for product and design leadership.

---

## 9. Guiding Principle

Raw data is preserved.  
Structure creates intelligence.  
Intelligence drives product decisions.