# SuperResearcher - Quick Start Guide

Get up and running with SuperResearcher in 5 minutes.

## Prerequisites

- Node.js 18+ installed ([download here](https://nodejs.org))
- Git (for cloning the repository)

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/superresearcher.git
cd superresearcher

# Install CLI dependencies
npm install

# Install UI dependencies
cd ui
npm install
cd ..

# Link the CLI globally (optional)
npm link
```

## Quick Test Drive

### 1. Create Your First Study

```bash
superresearcher init "My First Study"
```

This creates a new research project structure.

### 2. Add Some Research Data

Navigate to your project and add transcripts:

```bash
cd projects/my-first-study/context/transcripts/
```

Create a file `interview-1.md` with sample interview content.

### 3. Extract Insights

```bash
cd ../../../..  # Back to root
superresearcher extract my-first-study --agent
```

Or manually follow the generated prompt.

### 4. Launch the Web UI

```bash
superresearcher serve
```

The UI will open automatically at `http://localhost:3000`

## Using the Web UI

### Dashboard
Your home for overview statistics and recent activity.

### Projects
Browse all your research studies. Click on any project to see details.

### Insights
Search and filter insights across all projects. Rate insights for quality.

### Actions
View and manage action items generated from insights.

### Personas
See customer personas derived from your research.

### Feedback
Provide feedback on insights and research quality.

### Suggestions
Propose new research ideas and vote on suggestions from the team.

## Common Commands

```bash
# Create a new project
superresearcher init "Project Name" --type interview

# Extract insights
superresearcher extract project-name --agent

# Generate actions
superresearcher action project-name --agent

# Update personas
superresearcher persona project-name --agent

# Run quality check
superresearcher audit project-name

# Cross-study analysis
superresearcher analyze --agent

# Check setup
superresearcher doctor

# Start web UI
superresearcher serve

# Start web UI on custom port
superresearcher serve --port 3001
```

## Project Structure

```
projects/my-first-study/
├── context/
│   ├── study.md              # Edit: Study objectives
│   ├── methodology.md        # Edit: Research methods
│   ├── transcripts/          # Add: Interview transcripts (.md, .txt)
│   ├── surveys/              # Add: Survey data (.csv, .json)
│   └── reports/              # Add: Research reports (.pdf)
├── insights/
│   ├── insights.json         # Generated: Structured insights
│   └── insights.md           # Generated: Human-readable insights
├── actions/
│   ├── actions.json          # Generated: Action items
│   └── actions.md            # Generated: Human-readable actions
└── study.config.json         # Project configuration
```

## Typical Workflow

1. **Plan** → Create project with `init`
2. **Collect** → Add research files to `context/`
3. **Extract** → Run `extract` to get insights
4. **Review** → Use web UI to browse and refine
5. **Action** → Generate action items with `action`
6. **Persona** → Update personas with `persona`
7. **Analyze** → Run cross-study analysis
8. **Share** → Use web UI to collaborate with team

## Tips

- **Use `--agent` flag** to run prompts automatically (requires Cursor CLI)
- **Start with small studies** to get familiar with the workflow
- **Rate insights** in the web UI to track quality
- **Provide feedback** to improve research quality over time
- **Backup your data** - projects are in the `projects/` directory

## Troubleshooting

### "Command not found: superresearcher"

Run from the repo directory or use `npm link` to install globally.

### "Port 3000 is already in use"

```bash
superresearcher serve --port 3001
```

### "No projects found"

Create a project first:
```bash
superresearcher init "Test Study"
```

### UI not loading

1. Check that the server started successfully
2. Try clearing browser cache
3. Check for errors in the terminal

### Need help?

```bash
superresearcher --help
superresearcher doctor  # Check your setup
```

## Next Steps

- Read the full [README](README.md) for detailed documentation
- Check [UI_README](UI_README.md) for web interface details
- Review [PRIVACY](PRIVACY.md) for data management guidance
- Explore example workflows in the documentation

## Development Mode

For UI development:

```bash
# Terminal 1: Start API server
node server/index.js

# Terminal 2: Start Vite dev server
cd ui
npm run dev
```

Dev server runs at `http://localhost:5173` with hot reload.

## Building for Production

```bash
cd ui
npm run build
cd ..
superresearcher serve
```

## Key Features

✅ Extract insights from interviews, surveys, and reports
✅ Generate actionable items from insights
✅ Build and maintain customer personas
✅ Cross-study pattern analysis
✅ Web UI for team collaboration
✅ Quality ratings and feedback system
✅ Research suggestion crowdsourcing
✅ CSAT tracking for platform improvement
✅ Privacy-first data management
✅ No external database required

## Learn More

- **Main README**: Comprehensive documentation
- **UI Documentation**: Web interface guide
- **Privacy Guide**: Data management and security
- **Implementation Summary**: Technical details

Happy researching! 🔬

