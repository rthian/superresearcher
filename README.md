# SuperResearcher

SuperResearcher is a customer insights research workflow that runs inside Cursor, transforming raw research data into actionable insights, informed personas, and prioritized action items.

---

## What It Does

```
You provide                  SuperResearcher generates
────────────────────────     ────────────────────────────
Interview transcripts    →   Atomic customer insights
Survey data (CSV/JSON)   →   Impact & confidence ratings
Research reports         →   Persona updates
                         →   Prioritized action items
                         →   Cross-study analysis
```

**Core Value:**
- Centralize all customer research in a single source of truth
- Extract atomic, reusable insights from research studies
- Connect insights to customer personas
- Generate and track action items tied to research evidence
- Enable data-driven decisions with full traceability

---

## Setup Guide

### Step 1: Prerequisites

You'll need:
- **Node.js 18+** — [Download here](https://nodejs.org)
- **Cursor** — [Download here](https://cursor.com) (free)

Check your Node version:
```bash
node --version
# Should show v18.x.x or higher
```

### Step 2: Get SuperResearcher

Clone or download this repo:
```bash
git clone https://github.com/rthian/superresearcher.git
cd superresearcher
```

### Step 3: Install

```bash
npm install && npm link
```

This installs dependencies and lets you run `superresearcher` from anywhere.

### Step 4: Install Cursor CLI (optional)

For automated processing with `--agent` mode:
```bash
curl https://cursor.com/install -fsS | bash
agent login
```

Or from Cursor: `Cmd+Shift+P` → "Install 'agent' command", then run `agent login`.

Skip this if you prefer running prompts manually.

### Step 5: Verify Setup

```bash
superresearcher doctor
```

You should see all green checkmarks.

---

## Getting Started

### 1. Create a Project

```bash
superresearcher init "Checkout Flow Study"
```

### 2. Add Your Research Data

```
projects/checkout-flow-study/
├── context/
│   ├── study.md           # Edit with your objectives
│   ├── methodology.md     # Document your approach
│   ├── transcripts/       # Add .md or .txt files
│   └── surveys/           # Add .csv or .json files
```

### 3. Extract Insights

```bash
superresearcher extract checkout-flow-study --agent
```

### 4. Review Quality

```bash
superresearcher review checkout-flow-study --agent
```

### 5. Generate Actions

```bash
superresearcher action checkout-flow-study --agent
```

### 6. Update Personas

```bash
superresearcher persona checkout-flow-study --agent
```

---

## Commands

| Command | Description |
|---------|-------------|
| `superresearcher init "Name"` | Create a new research study project |
| `superresearcher extract <project>` | Extract insights from research data |
| `superresearcher review <project>` | Generate quality review of insights |
| `superresearcher action <project>` | Generate action items from insights |
| `superresearcher persona <project>` | Update personas based on insights |
| `superresearcher audit [project]` | Run QA checks on data quality |
| `superresearcher analyze` | Cross-study analysis across all projects |
| `superresearcher sync <project>` | Sync with Notion databases |
| `superresearcher doctor` | Check setup and configuration |

### Command Options

```bash
# Run automatically with Cursor Agent
superresearcher extract my-study --agent

# Focus review on specific area
superresearcher review my-study --focus completeness

# Filter actions by priority
superresearcher action my-study --priority high

# Create new persona
superresearcher persona my-study --create

# Validate existing personas
superresearcher persona my-study --validate

# Cross-study theme analysis
superresearcher analyze --themes

# Sync to Notion
superresearcher sync my-study --push
```

---

## Project Structure

```
superresearcher/
├── projects/                    # Your research projects
│   └── <study-name>/
│       ├── context/
│       │   ├── study.md         # Study metadata & objectives
│       │   ├── methodology.md   # Research methods
│       │   ├── transcripts/     # Interview transcripts
│       │   ├── reports/         # PDF reports
│       │   └── surveys/         # Survey data
│       ├── insights/
│       │   ├── insights.md      # Extracted insights
│       │   ├── insights.json    # JSON for sync
│       │   └── review.md        # Quality review
│       ├── personas/
│       │   └── updates.md/json  # Persona updates
│       └── actions/
│           └── actions.md/json  # Action items
│
├── shared/                      # Cross-study resources
│   ├── personas/                # Global persona definitions
│   ├── themes/                  # Identified themes
│   ├── patterns/                # Behavioral patterns
│   └── analysis/                # Cross-study analysis
│
├── .cursor/rules/               # AI guidance rules
└── .superresearcher/            # Global config
```

---

## What Goes Where

### Context Files (Input)

| File | What to Put |
|------|-------------|
| `study.md` | Business objectives, research questions, target participants |
| `methodology.md` | Methods used, interview guide, recruitment criteria |
| `transcripts/*.md` | Interview transcripts, user quotes, observations |
| `surveys/*.csv` | Survey response data |
| `surveys/*.json` | Structured survey data |

### Generated Outputs

| File | What You Get |
|------|--------------|
| `insights/insights.md` | Human-readable insights organized by category |
| `insights/insights.json` | Structured data for Notion sync |
| `insights/review.md` | Quality review with gaps and recommendations |
| `personas/updates.md` | Suggested persona changes with rationale |
| `actions/actions.md` | Prioritized action items with success metrics |

---

## Notion Integration

SuperResearcher can sync with your Notion databases.

### Setup

1. Create a Notion integration at [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Share your databases with the integration
3. Copy `.env.example` to `.env` and add your credentials:

```bash
NOTION_API_KEY=secret_xxx
NOTION_INSIGHTS_DATABASE_ID=xxx
NOTION_ACTIONS_DATABASE_ID=xxx
```

### Sync Commands

```bash
# Push local changes to Notion
superresearcher sync my-study --push

# Pull latest from Notion
superresearcher sync my-study --pull

# Preview changes without applying
superresearcher sync my-study --push --dry-run
```

---

## Data Quality Audit

Run quality checks across your research data:

```bash
superresearcher audit
```

Checks include:
- ✓ Unlinked insights (no source study)
- ✓ Actions without source insights
- ✓ Incomplete records (missing required fields)
- ✓ Unowned high-priority actions
- ✓ Stale action items
- ✓ Personas needing refresh

Generate detailed report:
```bash
superresearcher audit --report
```

---

## Cross-Study Analysis

Analyze patterns across multiple research projects:

```bash
# Full analysis
superresearcher analyze --agent

# Focus on specific analysis type
superresearcher analyze --themes
superresearcher analyze --patterns
superresearcher analyze --gaps
```

Outputs:
- `shared/analysis/cross-study-analysis.md`
- `shared/themes/themes.json`
- `shared/patterns/patterns.json`

---

## Tips

- **Start small.** Even a rough study.md generates useful structure.
- **Be specific.** The more context you provide, the better the insights.
- **Iterate.** Update your research data, re-extract, see what changes.
- **Use atomic insights.** One insight = one idea. Don't bundle.
- **Track evidence.** Always cite verbatim quotes and sources.

---

## Troubleshooting

### Check Setup
```bash
superresearcher doctor
```

### Common Issues

**"Project not found"**
- Verify project name/slug: `ls projects/`
- Project names are slugified (spaces → hyphens, lowercase)

**"No research data found"**
- Add transcripts to `context/transcripts/` (.md or .txt)
- Add surveys to `context/surveys/` (.csv or .json)

**"Notion sync failed"**
- Verify API key in `.env`
- Check database IDs are correct
- Ensure databases are shared with your integration

---

## Usage Analytics

SuperResearcher collects anonymous usage statistics.

**What we collect:**
- Command name (`init`, `extract`, etc.)
- CLI version
- Operating system
- Node.js version

**What we DON'T collect:**
- Research content, quotes, or insights
- File paths or project names
- Notion data or API keys
- Personal information

**Opt-out:**
```bash
export SUPERRESEARCHER_TELEMETRY=0
# Or per-command
superresearcher extract my-study --no-telemetry
```

---

## Requirements

- Node.js 18 or later
- Cursor (for running generated prompts)
- Cursor CLI (optional, for `--agent` mode)
- Notion account (optional, for sync)

---

## License

MIT License

---

**Created by Raymond Thian**

Based on the research database workflow defined in the PRD: Research Repository & Customer Insights Hub.
