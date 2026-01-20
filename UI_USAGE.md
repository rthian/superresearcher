# SuperResearcher Web UI - Usage Guide

## Getting Started

### 1. Start the Server

```bash
superresearcher serve
```

This will:
- Start the Express backend on port 3000
- Serve the built React frontend
- Automatically open your browser to `http://localhost:3000`

Optional flags:
```bash
superresearcher serve --port 3001           # Use a different port
superresearcher serve --no-browser          # Don't auto-open browser
superresearcher serve --no-telemetry        # Disable analytics
```

### 2. Navigate the UI

The UI has a clean sidebar navigation:

- **Dashboard** - Overview of all projects, insights, actions
- **Projects** - Browse and manage research projects
- **Insights** - Explore insights across all projects
- **Actions** - Manage action items
- **Personas** - View customer personas
- **Feedback** - Review feedback and quality issues
- **Suggestions** - Research suggestion board

---

## Key Features

### Global Search (⌘K / Ctrl+K)

Press **⌘K** (Mac) or **Ctrl+K** (Windows/Linux) anywhere in the app to open global search.

- Search across **all projects, insights, and actions**
- Results grouped by type
- Fuzzy matching for better results
- Use **↑↓** arrows to navigate, **Enter** to select
- **Esc** to close

**Example searches:**
- `mobile checkout` - Find insights about mobile checkout
- `high priority` - Find high-priority actions
- `user authentication` - Find projects about auth

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **⌘K** or **Ctrl+K** | Open global search |
| **⌘/** or **Ctrl+/** | Show keyboard shortcuts help |
| **Esc** | Close modals and overlays |
| **↑↓** | Navigate search results |
| **↵** | Select item |

Press **⌘/** to see all available shortcuts.

### Export Functionality

Export your data in multiple formats:

#### Export Insights
1. Go to **Insights Explorer**
2. Apply any filters you want
3. Click **Export CSV** or **Export JSON**
4. File downloads automatically

**CSV columns include:**
- Title, Category, Impact, Confidence
- Evidence, Recommended Actions
- Product Area, Customer Segment
- Project, Tags

#### Export Actions
1. Go to **Action Center**
2. Filter by status (if desired)
3. Click **Export CSV**

**CSV columns include:**
- Title, Description, Priority, Status
- Department, Effort, Impact
- Success Metrics, Project

### Filtering & Search

#### Insights Explorer
- **Search bar** - Full-text search across titles and evidence
- **Category filters** - Filter by Pain Point, Opportunity, Behavior, etc.
- **Real-time filtering** - Results update instantly

#### Action Center
- **Status filters** - Not Started, In Progress, Blocked, Complete
- **Visual indicators** - Color-coded priority and status badges
- **Quick stats** - See count of filtered actions

### Feedback & Collaboration

#### Rate Insights
1. Click on any insight
2. Rate on 4 dimensions:
   - Overall quality (1-5 stars)
   - Evidence strength
   - Actionability
   - Clarity
3. Add optional comments

#### Leave Feedback
1. Click **💬 Flag** on any insight or action
2. Select type: Quality Issue, Question, Suggestion, Bug
3. Set priority: Low, Medium, High
4. Add description
5. Submit

**Feedback status:**
- **Open** - Needs attention
- **Under Review** - Being addressed
- **Addressed** - Resolved
- **Dismissed** - Won't fix

#### Research Suggestions
1. Go to **Suggestions Board**
2. Click **+ New Suggestion**
3. Describe the research need
4. Link related insights
5. Vote on suggestions from others

---

## Page-by-Page Guide

### Dashboard

**What you see:**
- Total counts: Projects, Insights, Actions, Personas
- Recent activity feed
- High-impact insights (top 5)
- Actions by status breakdown

**Use cases:**
- Get a quick health check of all research
- See what's been added recently
- Identify high-impact insights requiring action

### Projects Library

**Features:**
- Grid view of all projects
- Status badges (Planning, Active, Complete)
- Quick metrics (# insights, # actions, participants)
- Click any project to view details

**Filters:**
- By status
- By type
- By date range

### Project Detail

**Tabs:**
1. **Overview** - Study metadata, timeline, team, objectives
2. **Insights** - All insights from this study
3. **Actions** - Generated actions from insights
4. **Context** - Original materials (methodology, transcripts)

**Actions:**
- Edit project metadata
- View linked insights/actions
- Export project report

### Insights Explorer

**Features:**
- Grid view of all insights across projects
- Category badges with colors
- Impact and confidence indicators
- Full-text search
- Multi-select category filters

**Export options:**
- CSV (for Excel/Sheets)
- JSON (for developers)

**Best practices:**
- Use filters to focus on specific categories
- Search for keywords to find related insights
- Export filtered views for stakeholder reports

### Action Center

**Features:**
- List view of all actions
- Status and priority badges
- Filter by status
- Export to CSV

**Coming soon:**
- Kanban board view with drag-and-drop
- Assign actions to team members
- Set due dates

**Best practices:**
- Start with "Not Started" filter to see backlog
- Export for weekly team reviews
- Link actions to Notion/Jira (via custom scripts)

### Persona Gallery

**Features:**
- Card view of all personas
- Type badges (Primary, Secondary, Negative)
- Demographics summary
- Supporting insights count

**Actions:**
- Click persona for full details
- View supporting insights
- Edit persona attributes

### Feedback Inbox

**For Researchers:**
- Review quality issues flagged by team
- Respond to feedback
- Mark items as addressed
- See feedback trends

**For Stakeholders:**
- Flag insights needing more evidence
- Ask questions about findings
- Suggest follow-up research

### Suggestions Board

**Features:**
- Upvote research ideas
- Add comments
- Track suggestion status
- See related insights

**Statuses:**
- Proposed → Planned → In Progress → Complete

---

## Tips & Tricks

### 1. Use Global Search for Everything
Don't navigate manually—press **⌘K** and search!

### 2. Export Before Meetings
Create filtered exports of insights/actions before stakeholder meetings.

### 3. Rate Insights Regularly
Quality ratings help researchers identify insights needing refinement.

### 4. Link Insights to Actions
Always reference the source insight in action descriptions.

### 5. Update Action Status Weekly
Keep the Action Center current for accurate dashboards.

### 6. Use Feedback for Collaboration
Instead of Slack messages, leave structured feedback in the app.

---

## Troubleshooting

### Server won't start
```
Error: Port 3000 is already in use
```
**Solution:** Use a different port:
```bash
superresearcher serve --port 3001
```

### Search not working
**Check:**
- Are there any projects with data?
- Try refreshing the page (Cmd+R)

### Export has no data
**Reason:** You've filtered down to 0 results.
**Solution:** Clear some filters and try again.

### Build errors after pulling updates
```bash
cd ui
npm install
npm run build
```

---

## Development

### Run UI in dev mode
```bash
cd ui
npm run dev
```

UI runs on `http://localhost:5173` and proxies API calls to `:3000`.

### Hot reload for backend
Use `nodemon`:
```bash
npm install -g nodemon
nodemon src/index.js serve
```

---

## Next Steps

- Explore the [FEATURES.md](FEATURES.md) for full feature list
- Read [PRIVACY.md](PRIVACY.md) for data handling details
- Check [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for technical docs

**Questions?** Open an issue on GitHub!

