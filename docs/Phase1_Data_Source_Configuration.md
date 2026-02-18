# Phase 1: Data Source Configuration

**Status:** Confirmed (2026-02-10)  
**Naming Convention:** `<type>-<source>-<company>` (e.g. `voc-appstore-gxb`, `nps-survey-gxb`, `csat-survey-gxb`)

---

## 1. Appbot (App Store Reviews)

### Format
**Markdown (.md)** — Appbot exports structured review reports, not CSV.

### File Structure
- **Location:** `projects/voc-appstore-gxb/context/transcripts/` (or `voc-appstore-gxs`)
- **Naming:** `{company}_{platform}_q{quarter}{year}.md`
  - `gxb_ios_q125.md` = GXB, iOS, Q1 2025
  - `gxb_ps_q125.md` = GXB, Play Store (Android), Q1 2025

### Review Block Structure (per review)
```markdown
### Review - 2025-03-30
**App:** GXBank (iOS) 
**Country:** Malaysia 
**Rating:** ★☆☆☆☆ 
**Sentiment:** negative 
**Topics:** ["Bugs", "Complexity", "Design & UX"] 
**Custom Topics:** ["3 - Bugs", "6 - User/App Experience"] 
**Language:** English 
**Author:** loklokk123 
**Version:** 2.2.5 
**Subject:** Not good app 
The app is so hard to use, shows a lot of error...
--- 
```

### Fields for Mapping
| Field | Source | Use |
|-------|--------|-----|
| Date | `### Review - YYYY-MM-DD` | Period tagging |
| App | `**App:**` | Organization (GXB/GXS) |
| Platform | Filename | iOS vs Android |
| Rating | `**Rating:**` | 1–5 stars |
| Sentiment | `**Sentiment:**` | positive/negative/mixed |
| Topics | `**Topics:**` | AI themes |
| Custom Topics | `**Custom Topics:**` | Appbot tags |
| Author | `**Author:**` | Anonymised ID |
| Subject | `**Subject:**` | Short summary |
| Body | After Subject | Verbatim for insight extraction |

### Ingestion
- Copy `.md` files from Appbot export into `context/transcripts/`
- Use existing VoC workflow: `superresearcher voc convert-to-chunks` if file > 50 reviews
- Run `superresearcher extract <project>` for insight extraction

### Project Structure
```
projects/voc-appstore-gxb/
├── context/
│   ├── study.md
│   ├── methodology.md
│   └── transcripts/
│       ├── gxb_ios_q125.md
│       ├── gxb_ios_q225.md
│       ├── gxb_ios_q125_chunks/   (if chunked)
│       └── ...
├── insights/
└── actions/
```

---

## 2. NPS / CSAT Survey (GXB GX Account Survey)

### Format
**CSV** — Export from SurveyMonkey/Qualtrics (e.g. `GXB GX Account Survey Q4 2025.xlsx - Sheet.csv`)

### File Structure
- **Header rows:** 2 (column names + sub-headers)
- **Naming:** `{company} {Product} Survey {Period}.xlsx - Sheet.csv` or `nps-survey-gxb-{period}.csv`

### Key Column Mapping

| SuperResearcher Field | CSV Column (approximate) | Notes |
|----------------------|--------------------------|-------|
| `period` | Derived from `Start Date` | e.g. 2026-Q1 or 2026-01 |
| `organization` | Fixed: GXB | From filename |
| `product` | GX Account / GXBank | Multiple products in one survey |
| **CSAT – GX Account** | `Overall, how satisfied are you with the GX Account?` | 1–10 |
| **NPS – GX Account** | `How likely are you to recommend the GX Account to a friend?` | 0–10 |
| **CSAT – GXBank** | `Overall, how satisfied are you with GXBank?` | 1–10 |
| **NPS – GXBank** | `How likely are you to recommend the GXBank to a friend?` | 0–10 |
| **CSAT – Bonus Pocket** | `Overall how satisfied are you with the Bonus Pocket feature?` | 1–10 |
| **Verbatim – Like** | `What did you like about the GX Account?` | Open-ended |
| **Verbatim – Improve** | `How can we improve the GX Account?` | Open-ended |
| **Verbatim – App Improve** | `How can we improve the GXBank app?` | Open-ended |

### Multi-Dimensional CSAT (1–10 scale)
| Dimension | CSV Column |
|-----------|------------|
| Design | `The visual design of the GXBank app appealed to me` |
| Ease of Transaction | `It was easy to perform transactions on the GXBank app` |
| Ease of Navigation | `It was easy to find what I needed on the GXBank app` |
| Responsive | `The GXBank app is fast and responsive` |
| Quality meets expectations | `The quality of products and services meet my expectations` |
| Info easy to understand | `Information on products and services is easy to understand` |
| Info comprehensive | `Information on products and services is comprehensive` |
| Security | `Security measures are sufficient to keep my account secure` |
| Delivery | `Products and services are delivered promptly` |
| Range meets needs | `The range of products and services meet my needs` |
| Rewards competitive | `Rewards/benefits are competitive` |
| Interest rates competitive | `Interest rates and fees are competitive` |
| Trust | `I trust GXS bank is working in my best interest` |

### Demographics
| Field | CSV Column |
|-------|------------|
| Income | `What is your monthly personal income?` |
| Age | `Which age group do you belong to?` |

### Ingestion into SuperResearcher
- **CSAT/NPS metrics:** Use existing CSV upload at `/api/csat/metrics/upload` or UI
- **Transform required:** Map survey columns to SuperResearcher format:
  ```csv
  period,organization,dimension,product,score,responses,survey_question,verbatim
  2026-Q1,GXB,bank-csat,GX Account,8.2,831,"Overall...","Flexicredit"
  ```
- **Verbatims:** Can be extracted for VoC insight extraction (separate workflow)

### Project Structure
```
projects/nps-survey-gxb/
projects/csat-survey-gxb/
```
Or combined: `projects/nps-csat-survey-gxb/` if both come from same survey file.

---

## 3. Naming Convention Summary

| Type | Source | Company | Example Project Slug |
|------|--------|---------|----------------------|
| voc | appstore | gxb | `voc-appstore-gxb` |
| voc | appstore | gxs | `voc-appstore-gxs` |
| nps | survey | gxb | `nps-survey-gxb` |
| nps | survey | gxs | `nps-survey-gxs` |
| csat | survey | gxb | `csat-survey-gxb` |
| csat | survey | gxs | `csat-survey-gxs` |

---

## 4. Monthly Ingestion Checklist

### Appbot (Monthly)
- [ ] Download Appbot report for GXB iOS → `gxb_ios_q{quarter}{year}.md`
- [ ] Download Appbot report for GXB Play Store → `gxb_ps_q{quarter}{year}.md`
- [ ] Repeat for GXS if applicable
- [ ] Copy to `projects/voc-appstore-{company}/context/transcripts/`
- [ ] If file > 50 reviews: `superresearcher voc convert-to-chunks <file> --chunk-size 25`
- [ ] Run `superresearcher extract voc-appstore-{company}` (or via Cursor)

### NPS/CSAT (Monthly)
- [ ] Export survey from platform (CSV)
- [ ] Map columns to `period,organization,dimension,product,score,responses,verbatim`
- [ ] Upload via CSAT Dashboard or `POST /api/csat/metrics/upload`
- [ ] (Optional) Extract verbatims for insight generation

---

## 5. Files Created

| Item | Path |
|------|------|
| GXB survey → CSAT mapping template | `templates/gxb-survey-to-csat-mapping.csv` |
| voc-appstore-gxb project | `projects/voc-appstore-gxb/` |
| Appbot copy instructions | See Section 4 checklist |

### Quick Start: Copy GXB Appbot data

```bash
# From appbot-data export
cp /path/to/appbot-data/data/gxb_ios_q125.md superresearcher/projects/voc-appstore-gxb/context/transcripts/
cp /path/to/appbot-data/data/gxb_ps_q125.md superresearcher/projects/voc-appstore-gxb/context/transcripts/
```
