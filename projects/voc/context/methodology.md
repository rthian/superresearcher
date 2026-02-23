# VOC Quarterly Study - Methodology

**Project:** Quarterly Voice of Customer Study (Q1 2026)  
**Last Updated:** January 31, 2026

---

## Overview

This methodology document outlines the systematic approach for collecting, analyzing, and reporting Voice of Customer (VOC) data for GXS and GXB digital banks on a quarterly basis.

---

## Data Collection Methods

### 1. App Store Review Analysis

**Frequency:** Continuous (daily scraping)  
**Sources:** iOS App Store, Google Play Store  
**Scope:** GXS Bank app, GXB Bank app

**Process:**
1. Automated scraping of new reviews daily
2. Store reviews in `context/transcripts/app-reviews-Q1-2026.json`
3. Categorize by rating (1-5 stars)
4. Extract sentiment, themes, and feature mentions
5. Tag by organization (GXS or GXB)

**Metrics:**
- Average rating per week/month
- Rating distribution
- Volume of reviews
- Sentiment trend

---

### 2. In-App CSAT Surveys

**Frequency:** Triggered after key events, always-on  
**Target:** 500+ responses per bank per quarter  
**Timing:** Post-transaction, post-support interaction, monthly check-in

**Survey Questions:**

**CSAT (Customer Satisfaction):**
- "How satisfied are you with [specific feature/interaction]?"
- Scale: 1-10 (1 = Very Dissatisfied, 10 = Very Satisfied)

**NPS (Net Promoter Score):**
- "How likely are you to recommend [GXS/GXB] to a friend or colleague?"
- Scale: 0-10 (0 = Not likely, 10 = Extremely likely)
- Follow-up: "What's the main reason for your score?"

**Open-Ended:**
- "What's one thing we could improve?"
- "What do you love most about [GXS/GXB]?"
- "Is there a feature you wish we had?"

**Distribution:**
- In-app modal after completing transaction
- Email survey to monthly active users
- Push notification with survey link

---

### 3. Customer Support Ticket Analysis

**Frequency:** Continuous (weekly exports)  
**Sources:** Zendesk, Intercom, or support platform  
**Scope:** All tickets submitted during quarter

**Data Points:**
- Ticket category (bug, feature request, how-to, complaint)
- Resolution time
- Customer satisfaction rating (if available)
- Verbatim customer messages
- Agent notes

**Analysis:**
1. Export all tickets weekly
2. Categorize by theme (e.g., "Card delivery issues", "Login problems")
3. Calculate top 10 issues by volume
4. Track resolution time trends
5. Identify systemic vs. one-off issues

---

### 4. User Interviews

**Frequency:** Quarterly (10 per bank)  
**Duration:** 45 minutes each  
**Format:** Video call (Zoom/Google Meet) with recording and transcript

**Recruitment:**
- **Promoters (NPS 9-10):** 3-4 interviews
- **Passives (NPS 7-8):** 3-4 interviews
- **Detractors (NPS 0-6):** 3-4 interviews

**Incentive:** $50 gift card or bank credit

**Interview Guide:**

**Part 1: Context (5 min)**
- How long have you been using [GXS/GXB]?
- What prompted you to open an account?
- What other banks do you use?

**Part 2: Usage Patterns (10 min)**
- Walk me through how you typically use the app
- What features do you use most often?
- Are there features you tried once and never used again? Why?

**Part 3: Pain Points (15 min)**
- What frustrates you most about [GXS/GXB]?
- Have you ever contacted customer support? How was it?
- What would make you switch to another bank?

**Part 4: Feature Requests (10 min)**
- If you could add one feature, what would it be?
- What do other banks do better?
- What does [GXS/GXB] do better than competitors?

**Part 5: Future Vision (5 min)**
- What would your ideal banking experience look like?
- How do you see yourself using [GXS/GXB] a year from now?

**Storage:** Store transcripts in `context/transcripts/interview-[ID]-[name].md`

---

### 5. Social Media & Online Monitoring

**Frequency:** Continuous (daily monitoring)  
**Sources:** Facebook, Instagram, Twitter, Reddit, HardwareZone, banking forums

**Approach:**
1. Set up alerts for brand mentions
2. Manual monitoring of banking discussion threads
3. Screenshot and save relevant posts
4. Categorize by sentiment and theme

**Storage:** Summarize in `context/reports/social-listening-Q1-2026.md`

---

## Analysis Framework

### Step 1: Data Aggregation
- Compile all data sources into one workspace
- Tag each data point with:
  - Organization (GXS/GXB)
  - Source (app review, survey, ticket, interview, social)
  - Date collected
  - Sentiment (positive, neutral, negative)

### Step 2: Thematic Analysis
Use the SuperResearcher CLI to extract insights:

```bash
# Chunk all transcripts and reviews
superresearcher chunk --project voc

# Extract insights using AI
superresearcher extract --project voc

# Generate action items
superresearcher actions --project voc

# Update personas
superresearcher personas --project voc
```

### Step 3: Quantitative Metrics
Calculate and track:
- **CSAT Score:** Average satisfaction rating (1-10 scale)
- **NPS Score:** % Promoters - % Detractors
- **App Store Rating:** Average star rating
- **Support Ticket Volume:** Tickets per 1000 customers
- **Resolution Time:** Average hours to close ticket

Store in `shared/csat-metrics.json` via:
```bash
superresearcher csat upload --file voc-q1-2026.csv
```

### Step 4: Comparative Analysis
- GXS vs. GXB performance
- Quarter-over-quarter trends
- Benchmark against industry standards

### Step 5: Insight Prioritization
Score each insight on:
- **Impact:** High/Medium/Low (on customer satisfaction)
- **Confidence:** High/Medium/Low (based on evidence strength)
- **Frequency:** How many customers mentioned this?

---

## Reporting Format

### 1. Executive Summary (PowerPoint)
- **Slide 1:** Overall CSAT/NPS scores, QoQ change
- **Slide 2:** GXS performance highlights
- **Slide 3:** GXB performance highlights
- **Slide 4:** Top 5 insights (with quotes)
- **Slide 5:** Top 5 recommended actions
- **Slide 6:** Quarter-over-quarter trends

### 2. Detailed Insights Report
- **Format:** Markdown (`insights/insights.md`) + JSON (`insights/insights.json`)
- **Structure:** Organized by category (Pain Point, Opportunity, Behavior, etc.)
- **Content:** Evidence, impact, recommended actions

### 3. Action Items Dashboard
- **Format:** Markdown (`actions/actions.md`) + JSON (`actions/actions.json`)
- **Priority:** High/Medium/Low
- **Owner:** Product, Engineering, Support, Marketing
- **Effort:** Small/Medium/Large
- **Success Metrics:** How to measure impact

### 4. Persona Updates
- **Format:** JSON (`personas/updates.json`) + Markdown (`personas/updates.md`)
- **Content:** Updated behavioral patterns, pain points, goals
- **Supporting Insights:** Links to relevant insights

---

## Quality Assurance

### Data Quality Checks
- [ ] Survey response rate >80%
- [ ] Interview participant diversity (age, usage, NPS score)
- [ ] No duplicate responses
- [ ] All data sources collected for full quarter
- [ ] Minimum 500 responses per bank

### Analysis Quality Checks
- [ ] All insights have supporting evidence (quotes)
- [ ] Impact and confidence ratings assigned
- [ ] No conflicting insights without explanation
- [ ] Actions linked to specific insights
- [ ] Persona updates reflect new data

### Reporting Quality Checks
- [ ] Executive summary reviewed by project lead
- [ ] All stakeholders get advance copy
- [ ] Recommendations include effort estimates
- [ ] Success metrics defined for each action
- [ ] Previous quarter's trends referenced

---

## Timeline Template (Per Quarter)

| Phase | Duration | Activities |
|-------|----------|------------|
| **Planning** | Week 0 | Set up data collection, recruit interview participants |
| **Collection** | Weeks 1-6 | Surveys live, interviews conducted, continuous monitoring |
| **Analysis** | Week 7 | Data aggregation, thematic analysis, insight extraction |
| **Reporting** | Week 8 | Generate reports, create presentations |
| **Presentation** | Week 9 | Stakeholder meetings, action item assignment |
| **Follow-Up** | Week 10-12 | Track action item progress, prepare for next quarter |

---

## Tools & Systems

- **Survey Platform:** In-app SDK or external (Typeform, SurveyMonkey)
- **Interview Transcription:** Otter.ai, Rev.com, or manual
- **App Store Scraping:** Custom script or third-party API
- **Support Tickets:** Zendesk export
- **Social Listening:** Mention.com, Brand24, or manual
- **Analysis:** SuperResearcher CLI
- **Reporting:** Google Slides, Notion, or PowerPoint
- **Dashboard:** Integrated with shared/csat-metrics.json

---

## Ethical Considerations

- All interview participants sign consent forms
- Customer data anonymized in reports
- Quotes attributed generically (e.g., "GXS customer, age 30-40")
- No personally identifiable information (PII) in insights
- Survey participation is voluntary
- Opt-out option available for all communications

---

## Contact

**Questions about methodology?**  
Contact: Customer Insights Team  
Email: insights@[company].com
