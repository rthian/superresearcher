# SuperResearcher VoC Pipeline: Complete Workflow Guide

**Last Updated:** 2026-01-20  
**Purpose:** End-to-end guide for processing Voice of Customer data from app store reviews

---

## 📋 Table of Contents

1. [Pipeline Overview](#pipeline-overview)
2. [Workflow Steps](#workflow-steps)
3. [Setup Instructions](#setup-instructions)
4. [CLI Commands Reference](#cli-commands-reference)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## 🔄 Pipeline Overview

The VoC pipeline transforms raw app store reviews into actionable product insights through a structured 6-step process:

```
Raw Reviews (MD) → Chunks → Extraction Prompt → Insights (JSON/MD) → Actions → Personas
```

### Key Principles

1. **Immutable Source Data** - Raw files never edited, preserved as audit trail
2. **Chunked Processing** - Large files split into ~20-25 review chunks for AI processing
3. **Structured Output** - JSON schema ensures consistent, queryable insights
4. **Action-Oriented** - Every insight should suggest concrete next steps
5. **Evidence-Based** - All insights must cite verbatim quotes from source

---

## 🔢 Workflow Steps

### Step 1: Organize Raw Data

**Location:** `projects/{project-slug}/context/transcripts/`

Place your raw app store review files here. Naming convention:
- `{bank}_{platform}_q{quarter}{year}.md`
- Example: `gxs_ios_q125.md` (GXS, iOS, Q1 2025)

**What this looks like:**
```
projects/appstore/context/transcripts/
├── gxs_ios_q125.md      (raw reviews - immutable)
├── gxs_ios_q225.md
├── gxs_ps_q125.md
└── gxs_ps_q225.md
```

---

### Step 2: Convert to Chunks

**Command:**
```bash
superresearcher voc convert-to-chunks projects/appstore/context/transcripts/gxs_ios_q125.md --chunk-size 25
```

**What this does:**
- Splits large review file into smaller chunks (~25 reviews each)
- Creates folder: `{filename}_chunks/`
- Each chunk preserves metadata (bank, quarter, platform)
- Chunks are numbered sequentially

**Output:**
```
projects/appstore/context/transcripts/
├── gxs_ios_q125.md
└── gxs_ios_q125_chunks/
    ├── gxs_ios_q125_chunk_01.md (reviews 1-25)
    ├── gxs_ios_q125_chunk_02.md (reviews 26-50)
    └── gxs_ios_q125_chunk_03.md (reviews 51-75)
```

**When to use:**
- File has 50+ reviews
- AI context window limits
- Parallel processing needed

---

### Step 3: Generate Extraction Prompt

**Command:**
```bash
superresearcher extract appstore
```

**What this does:**
- Reads all transcripts from `context/transcripts/`
- Reads study metadata from `context/study.md` and `context/methodology.md`
- Combines into comprehensive extraction prompt
- Saves to `projects/appstore/prompts/extract.md`

**Prompt includes:**
1. Study context (objectives, methodology)
2. All review data (verbatim)
3. Extraction instructions
4. Output format (JSON schema)
5. Quality guidelines

**Output structure:**
```markdown
# Customer Insights Extraction

## Study Context
[study.md content]
[methodology.md content]

## Research Data
### Interview Transcripts
#### gxs_ios_q125.md
[full reviews]

## Your Task
[extraction instructions]

## Output Format
[JSON schema]
```

---

### Step 4: Extract Insights (AI)

**Two approaches:**

#### A. Manual (Copy/Paste to Claude)
1. Open `prompts/extract.md`
2. Copy entire content
3. Paste into Claude/ChatGPT
4. Review AI-generated insights
5. Save output to `insights/insights.json`

#### B. CLI (Future Feature)
```bash
superresearcher extract appstore --ai claude
```

**What good insights look like:**

✅ **Good:**
```json
{
  "id": "insight-001",
  "title": "Users demand Apple Pay integration for iOS banking app",
  "category": "Unmet Need",
  "impactLevel": "High",
  "confidenceLevel": "High",
  "evidence": "\"Can't use on Apple pay in this day and age\" - cocodna, iOS Q1",
  "source": "gxs_ios_q125.md",
  "recommendedActions": "1. Prioritize Apple Pay integration. 2. Communicate timeline publicly."
}
```

❌ **Bad (too vague):**
```json
{
  "title": "Users want better payment options",
  "evidence": "Some users mentioned payments"
}
```

---

### Step 5: Generate Actions

**Command:**
```bash
superresearcher action appstore
```

**What this does:**
- Reads `insights/insights.json`
- Prioritizes by impact level
- Generates actionable tasks
- Saves to `actions/actions.json`

**Action schema:**
```json
{
  "id": "action-001",
  "title": "Integrate Apple Pay for iOS debit card",
  "priority": "High",
  "department": "Product",
  "effort": "Large",
  "impact": "High",
  "successMetrics": "50% iOS users add card to Apple Wallet within 3 months",
  "sourceInsight": "insight-001",
  "status": "Not Started"
}
```

---

### Step 6: Update Personas

**Command:**
```bash
superresearcher persona appstore
```

**What this does:**
- Links insights to existing personas
- Identifies new behavioral patterns
- Updates persona attributes
- Saves to `personas/updates.json`

---

## 🛠️ Setup Instructions

### Initial Project Setup

```bash
# 1. Create new project
superresearcher init appstore --type "User Interview"

# 2. Add your raw review files
cp your_reviews.md projects/appstore/context/transcripts/

# 3. Edit study metadata
code projects/appstore/context/study.md
code projects/appstore/context/methodology.md
```

### Complete Processing Flow

```bash
# Step 1: Convert large files to chunks (if needed)
for file in projects/appstore/context/transcripts/*.md; do
  superresearcher voc convert-to-chunks "$file" --chunk-size 25
done

# Step 2: Generate extraction prompt
superresearcher prompts generate appstore extract

# Step 3: Extract insights (manual with AI)
# - Open prompts/extract.md
# - Copy to Claude
# - Save output to insights/insights.json

# Step 4: Generate actions
superresearcher actions generate appstore

# Step 5: Update personas
superresearcher personas update appstore

# Step 6: Review insights in UI
superresearcher serve
# Open http://localhost:3000/projects/appstore
```

---

## 📚 CLI Commands Reference

### VoC Commands

```bash
# Convert reviews to chunks
superresearcher voc convert-to-chunks <file> --chunk-size <number>

# Convert chunks to JSON (future)
superresearcher voc convert-to-json <chunk-file>
```

### Prompt Commands

```bash
# Generate extraction prompt
superresearcher prompts generate <project> extract

# Generate action generation prompt
superresearcher prompts generate <project> actions

# Generate persona update prompt
superresearcher prompts generate <project> personas
```

### Insight Commands

```bash
# Extract insights (future AI integration)
superresearcher extract <project> --ai <provider>

# Validate insights schema
superresearcher insights validate <project>
```

### Action Commands

```bash
# Generate actions from insights
superresearcher actions generate <project>

# List all actions
superresearcher actions list

# Update action status
superresearcher actions update <action-id> --status "In Progress"
```

### Persona Commands

```bash
# Update personas from insights
superresearcher personas update <project>

# List all personas
superresearcher personas list

# View persona details
superresearcher personas show <persona-id>
```

### Server Commands

```bash
# Start web UI
superresearcher serve --port 3000

# Start with auto-open browser
superresearcher serve --browser
```

---

## ✅ Best Practices

### Data Organization

1. **Consistent naming:** Use `{bank}_{platform}_q{quarter}{year}.md` format
2. **Immutable sources:** Never edit raw transcript files
3. **Version control:** Commit all files except large media
4. **Backup strategy:** Keep original review exports safe

### Chunking Strategy

1. **Optimal size:** 20-25 reviews per chunk
2. **Context preservation:** Each chunk should be self-contained
3. **Parallel processing:** Split large files for faster AI processing
4. **Chunk review:** Spot-check a few chunks for data integrity

### Insight Extraction

1. **Atomic insights:** One insight = one discrete observation
2. **Strong evidence:** Include verbatim quotes with author
3. **Source tracking:** Always cite filename
4. **Impact assessment:** Consider user segment size and frequency
5. **Confidence rating:** Base on evidence quality and quantity

### Quality Checks

```bash
# Validate JSON structure
jq . projects/appstore/insights/insights.json

# Count insights by category
jq '.insights | group_by(.category) | map({category: .[0].category, count: length})' \
  projects/appstore/insights/insights.json

# Find high-impact insights
jq '.insights[] | select(.impactLevel == "High")' \
  projects/appstore/insights/insights.json
```

---

## 🐛 Troubleshooting

### Issue: "File not found" when running commands

**Solution:**
- Ensure you're in the project root: `cd /path/to/superresearcher`
- Use full relative paths: `projects/appstore/context/transcripts/file.md`
- Check file exists: `ls projects/appstore/context/transcripts/`

### Issue: Chunks are too large for AI

**Solution:**
```bash
# Reduce chunk size
superresearcher voc convert-to-chunks file.md --chunk-size 15

# Or manually split the file
```

### Issue: Extraction prompt missing data

**Solution:**
```bash
# Verify files exist in correct locations
ls projects/appstore/context/transcripts/
ls projects/appstore/context/study.md

# Regenerate prompt
superresearcher prompts generate appstore extract --force
```

### Issue: Invalid JSON output

**Solution:**
```bash
# Validate JSON
jq . projects/appstore/insights/insights.json

# Fix common issues:
# - Missing commas between objects
# - Unescaped quotes in strings
# - Trailing commas in arrays
```

### Issue: Missing insights in UI

**Solution:**
```bash
# Check file exists and has data
cat projects/appstore/insights/insights.json

# Restart server
superresearcher serve --port 3000

# Clear browser cache and refresh
```

---

## 🎯 Success Metrics

Track these KPIs for your VoC pipeline:

1. **Processing Speed:** Time from raw data to insights
2. **Insight Quality:** % of insights that are actionable
3. **Action Conversion:** % of insights that generate actions
4. **Implementation Rate:** % of actions completed
5. **Business Impact:** Revenue/satisfaction change from implemented actions

---

## 📖 Additional Resources

- [VoC Pipeline Principles](./research/voc/SuperResearcher_VoC_Pipeline.md)
- [Insight Extraction Rules](./.cursor/rules/insight-extraction.mdc)
- [Action Generation Rules](./.cursor/rules/action-generation.mdc)
- [Persona Management Rules](./.cursor/rules/persona-management.mdc)

---

## 🆘 Getting Help

- **Documentation:** `superresearcher --help`
- **Command help:** `superresearcher <command> --help`
- **Issues:** Check `docs/troubleshooting.md`
- **Examples:** See `examples/` directory

---

**Next Steps:**
1. ✅ Raw reviews organized
2. ✅ Chunks created
3. ✅ Extraction prompt generated
4. ✅ Insights extracted (15 insights)
5. ⏭️ Generate actions from insights
6. ⏭️ Update personas with findings
7. ⏭️ Review in web UI

