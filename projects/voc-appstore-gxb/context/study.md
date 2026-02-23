# GXB App Store Reviews (VoC)

**Project:** voc-appstore-gxb  
**Type:** Voice of Customer (App Store)  
**Organization:** GXB  
**Source:** Appbot  
**Cadence:** Monthly  
**Naming:** `<type>-<source>-<company>`

---

## Business Objective

Extract actionable product insights from GXB (GXBank) app store reviews. Support quarterly VOC reporting and monthly product leadership updates.

---

## Data Source

- **Format:** Markdown (.md) from Appbot export
- **Files:** `gxb_ios_q125.md`, `gxb_ps_q125.md`, etc.
- **Structure:** Each review has Rating, Sentiment, Topics, Subject, Body

---

## Research Questions

1. What are the top pain points and complaints?
2. What features are users requesting?
3. How does sentiment trend by quarter?
4. What differentiates iOS vs Android feedback?

---

## Ingestion Steps

1. Download Appbot report → `gxb_{ios|ps}_q{quarter}{year}.md`
2. Copy to `context/transcripts/`
3. If > 50 reviews: `superresearcher voc convert-to-chunks <file> --chunk-size 25`
4. Run `superresearcher extract voc-appstore-gxb`

---

## Target Participants

- **Segment:** GXBank app users (iOS + Android)
- **Source:** Public App Store / Play Store reviews
- **Coverage:** Malaysia market
