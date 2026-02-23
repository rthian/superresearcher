# SuperResearcher Troubleshooting Guide

## Web UI Issues

### Issue: Interface Shows No Data / Empty Projects

**Symptoms:**
- Web UI loads but shows no projects
- API returns `{"projects":[]}`
- Insights and actions not visible

**Root Cause:**
The server is running from the wrong directory. The server uses `process.cwd()` to find the `projects/` folder, so it must be started from the repository root.

**Solution:**

```bash
# 1. Stop the current server
pkill -f "node.*superresearcher serve"

# 2. Change to the project root directory
cd /Users/yewmun.thian/Desktop/Make/superresearcher
# Or: cd ~/path/to/superresearcher

# 3. Verify you're in the correct directory
pwd  # Should show: /path/to/superresearcher
ls   # Should see: projects/, server/, src/, package.json

# 4. Start the server
superresearcher serve --port 3000
```

**Prevention:**
Always run `superresearcher serve` from the repository root, NOT from inside a project folder.

```bash
✅ CORRECT:
cd /Users/yewmun.thian/Desktop/Make/superresearcher
superresearcher serve

❌ WRONG:
cd /Users/yewmun.thian/Desktop/Make/superresearcher/projects/appstore
superresearcher serve  # Won't find projects!
```

**Debug Tool:**
Check the server's working directory:
```bash
curl http://localhost:3000/api/debug/info
# Should return: {"cwd":"/path/to/superresearcher", ...}
```

---

### Issue: Port Already in Use

**Symptoms:**
```
Port 3000 is already in use
EADDRINUSE
```

**Solution 1: Use a Different Port**
```bash
superresearcher serve --port 3001
```

**Solution 2: Kill the Process Using the Port**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill it
kill -9 $(lsof -ti:3000)

# Or kill all node servers
pkill -f "node.*superresearcher serve"
```

---

### Issue: 404 on All Pages

**Symptoms:**
- API endpoints work (`/api/projects`)
- But navigating to `/projects/appstore` gives 404

**Root Cause:**
The UI hasn't been built yet.

**Solution:**
```bash
# Build the UI
cd ui/
npm install
npm run build

# Then restart the server
cd ..
superresearcher serve
```

---

## CLI Command Issues

### Issue: `error: unknown command 'actions'`

**Problem:**
Using incorrect plural command names.

**Solution:**
Use singular forms:

```bash
# ❌ WRONG
superresearcher actions generate appstore
superresearcher personas update appstore

# ✅ CORRECT
superresearcher action appstore
superresearcher persona appstore
```

**All Correct Commands:**
```bash
superresearcher extract <project>     # Generate extraction prompt
superresearcher action <project>      # Generate action prompt
superresearcher persona <project>     # Generate persona prompt
superresearcher serve --port 3000     # Start web UI
superresearcher voc convert-to-chunks <file> --chunk-size 25
```

---

### Issue: File Not Found When Converting to Chunks

**Symptoms:**
```
✖ File not found: context/transcripts/file.md
```

**Solution:**
Use the full relative path from the repository root:

```bash
# ❌ WRONG (from project directory)
cd projects/appstore
superresearcher voc convert-to-chunks context/transcripts/file.md

# ✅ CORRECT (from repository root)
cd /Users/yewmun.thian/Desktop/Make/superresearcher
superresearcher voc convert-to-chunks projects/appstore/context/transcripts/file.md --chunk-size 25
```

---

## Insight Extraction Issues

### Issue: Insights Not Generated After Running Extract Command

**Problem:**
The `extract` command only generates a prompt file, it doesn't run the extraction.

**Solution:**
The extraction is a two-step process:

```bash
# Step 1: Generate the prompt
superresearcher extract appstore
# This creates: projects/appstore/prompts/extract.md

# Step 2: Run the prompt with AI
# Option A: Open extract.md in Cursor and run with AI
# Option B: Copy extract.md content to Claude/ChatGPT
# Option C: Use Cursor Agent mode

# Step 3: Save AI output to insights.json
# Create: projects/appstore/insights/insights.json
```

Same applies for `action` and `persona` commands.

---

## Data Format Issues

### Issue: Insights JSON Invalid

**Symptoms:**
- API returns error when loading insights
- UI shows corrupted data

**Solution:**
Validate your JSON format:

```bash
# Check if JSON is valid
cat projects/appstore/insights/insights.json | python3 -m json.tool

# Or use jq if installed
jq . projects/appstore/insights/insights.json
```

**Required JSON Structure:**
```json
{
  "extractedAt": "2026-01-20T10:30:00Z",
  "studyId": "appstore",
  "totalInsights": 15,
  "insights": [
    {
      "id": "insight-001",
      "title": "Title here",
      "category": "Pain Point",
      "impactLevel": "High",
      "confidenceLevel": "High",
      "evidence": "Quote with source",
      "source": "filename.md",
      "recommendedActions": "Actions here",
      "productArea": "Area name",
      "customerSegment": "Segment name",
      "tags": ["tag1", "tag2"]
    }
  ]
}
```

---

## System Health Check

### Run the Doctor Command

```bash
superresearcher doctor
```

This checks:
- Node.js version
- Package installation
- Project structure
- File permissions
- API connectivity (if server is running)

---

## Getting Help

### Check Logs

**Server Logs:**
If running in background, check terminal output:
```bash
# Find the terminal file
ls ~/.cursor/projects/*/terminals/

# Read the server output
tail -f ~/.cursor/projects/*/terminals/2.txt
```

**API Debug Endpoint:**
```bash
curl http://localhost:3000/api/debug/info
```

**Check Server Process:**
```bash
ps aux | grep "node.*superresearcher"
```

### Common Commands for Debugging

```bash
# List all projects
ls -la projects/

# Check project structure
tree projects/appstore/

# Verify insights exist
cat projects/appstore/insights/insights.json | head -50

# Test API directly
curl http://localhost:3000/api/projects
curl http://localhost:3000/api/insights
curl http://localhost:3000/api/projects/appstore/insights

# Check server status
lsof -ti:3000  # Should return a process ID if running
```

---

## Quick Reference

### Directory Structure Requirements

```
superresearcher/
├── projects/
│   └── appstore/
│       ├── study.config.json  ← Required
│       ├── context/
│       │   └── transcripts/
│       ├── insights/
│       │   ├── insights.json  ← API reads this
│       │   └── insights.md
│       ├── actions/
│       │   └── actions.json
│       └── prompts/
│           ├── extract.md
│           ├── action.md
│           └── persona.md
├── server/  ← Server code
├── src/     ← CLI code
└── ui/      ← Web UI code
```

### Environment Requirements

- **Node.js:** 18+ required
- **npm:** 8+ required
- **Working Directory:** Must be repository root for server
- **Ports:** 3000 (default) or specify with --port

---

## Still Having Issues?

1. Run `superresearcher doctor`
2. Check you're in the correct directory: `pwd`
3. Verify data files exist: `ls projects/appstore/insights/`
4. Test API directly: `curl http://localhost:3000/api/projects`
5. Check server logs in terminal

If issues persist, check the documentation:
- `docs/VoC_Workflow_Guide.md`
- `docs/VoC_Quick_Reference.md`
- `UI_README.md`

