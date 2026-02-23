# VoC Pipeline Quick Reference Card

**Print this and keep handy!**

---

## 🚀 Complete Workflow (6 Steps)

```
1. Organize    → projects/{slug}/context/transcripts/
2. Chunk       → superresearcher voc convert-to-chunks <file> --chunk-size 25
3. Prompt      → superresearcher prompts generate {slug} extract
4. Extract     → Copy prompts/extract.md to Claude → Save to insights/insights.json
5. Actions     → superresearcher actions generate {slug}
6. Personas    → superresearcher personas update {slug}
```

---

## 📁 File Structure

```
projects/{slug}/
├── context/
│   ├── study.md                    # Edit: Study objectives
│   ├── methodology.md              # Edit: Research methods
│   └── transcripts/
│       ├── reviews_q1.md          # Raw data (immutable)
│       └── reviews_q1_chunks/     # Generated chunks
├── prompts/
│   └── extract.md                 # Generated: AI extraction prompt
├── insights/
│   ├── insights.json              # Generated: Structured insights
│   └── insights.md                # Generated: Human-readable
├── actions/
│   └── actions.json               # Generated: Action items
└── personas/
    └── updates.json               # Generated: Persona updates
```

---

## ⌨️ Essential Commands

```bash
# Start new project
superresearcher init {slug} --type "User Interview"

# Chunk large files
superresearcher voc convert-to-chunks {file} --chunk-size 25

# Generate extraction prompt
superresearcher extract {slug}

# Generate action items (creates prompt for AI)
superresearcher action {slug}

# Start web UI
superresearcher serve --port 3000
```

---

## ✅ Insight Quality Checklist

- [ ] Atomic (one insight = one idea)
- [ ] Evidence-based (includes verbatim quote)
- [ ] Source cited (filename)
- [ ] Categorized (Pain Point, Opportunity, etc.)
- [ ] Impact rated (High/Medium/Low)
- [ ] Confidence rated (High/Medium/Low)
- [ ] Actions suggested (1-2 concrete steps)
- [ ] Product area tagged
- [ ] Customer segment identified

---

## 📊 Insight Categories

1. **Pain Point** - User frustrations, problems
2. **Opportunity** - Potential improvements
3. **Behavior** - How users actually behave
4. **Preference** - What users like/prefer
5. **Unmet Need** - Gaps in experience
6. **Bug Report** - Technical issues
7. **Positive Feedback** - What works well

---

## 🎯 Impact Assessment

**High Impact:**
- Affects >50% of users
- Blocking core functionality
- Competitive disadvantage
- Trust/security issue

**Medium Impact:**
- Affects 10-50% users
- Workaround exists
- Nice-to-have feature
- Minor UX friction

**Low Impact:**
- Affects <10% users
- Edge case
- Cosmetic issue
- Minor preference

---

## 🔧 Troubleshooting Quick Fixes

**File not found:**
```bash
pwd  # Check you're in project root
ls projects/{slug}/context/transcripts/
```

**Invalid JSON:**
```bash
jq . projects/{slug}/insights/insights.json
```

**Missing chunks:**
```bash
ls projects/{slug}/context/transcripts/*_chunks/
```

**UI not loading data:**
```bash
cat projects/{slug}/insights/insights.json  # Verify data exists
# Restart server
superresearcher serve --port 3000
```

---

## 📐 Chunking Guidelines

| File Size | Reviews | Chunk Size |
|-----------|---------|------------|
| Small     | <50     | No chunking needed |
| Medium    | 50-100  | 25 reviews/chunk |
| Large     | 100-200 | 20 reviews/chunk |
| Very Large| 200+    | 15 reviews/chunk |

---

## 🎨 JSON Schema Template

```json
{
  "id": "insight-XXX",
  "title": "Clear, specific statement",
  "category": "Pain Point",
  "impactLevel": "High",
  "confidenceLevel": "High",
  "evidence": "\"Verbatim quote\" - Author, Source",
  "source": "filename.md",
  "recommendedActions": "1. Action. 2. Action.",
  "productArea": "Area",
  "customerSegment": "Segment",
  "tags": ["tag1", "tag2"]
}
```

---

## 📞 Help Commands

```bash
superresearcher --help
superresearcher voc --help
superresearcher prompts --help
superresearcher actions --help
```

---

## 🌟 Pro Tips

1. **Name consistently:** `{bank}_{platform}_q{quarter}{year}.md`
2. **Never edit raw files:** They're your audit trail
3. **Chunk before AI:** Prevents context window limits
4. **Validate JSON:** Use `jq` before committing
5. **Review in UI:** Easier to spot patterns
6. **Tag extensively:** Makes filtering easier later
7. **Link actions to insights:** Maintains traceability
8. **Update personas regularly:** Keep them current

---

**Quick Links:**
- Full Guide: `docs/VoC_Workflow_Guide.md`
- VoC Principles: `docs/research/voc/SuperResearcher_VoC_Pipeline.md`
- Web UI: `http://localhost:3000` (when server running)

