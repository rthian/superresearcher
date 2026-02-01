# Privacy & Data Management

SuperResearcher is designed to keep your research data private by default.

## What's Committed to Git

By default, only the following are tracked in Git:
- Application code (CLI, server, UI)
- Configuration files
- Documentation
- Empty directory structure

## What's NOT Committed (Private Data)

The following are automatically excluded via `.gitignore`:
- **All project data** under `projects/*/`
  - Transcripts
  - Surveys
  - Reports (PDFs)
  - Extracted insights
  - Generated actions
  - Feedback items

- **All shared/generated data**
  - Personas
  - Themes and patterns
  - Cross-study analysis
  - CSAT responses
  - Research suggestions

## Keeping Your Data Local

### Option 1: Keep All Studies Local (Recommended for Sensitive Data)

The default `.gitignore` already excludes all project and shared data. Just use the tool normally and your data stays local.

### Option 2: Selective Sharing (For Example/Demo Projects)

If you want to share specific non-sensitive example projects:

1. Create an example project:
   ```bash
   superresearcher init "Example Public Study"
   ```

2. Temporarily modify `.gitignore` to allow that specific project:
   ```gitignore
   # In .gitignore, add before the projects/*/ exclusion:
   !projects/example-public-study/
   ```

3. Commit only that example project

### Option 3: Share the Tool, Not the Data

The recommended approach for public repositories:

1. Fork/clone the repo
2. Add your projects locally (they're auto-ignored)
3. Share improvements to the tool code via PRs
4. Keep your research data completely separate

## Notion Sync

If you use Notion sync:
- Your `.env` file is gitignored (API keys stay private)
- Data in Notion is controlled by your Notion workspace permissions

## Local Backups

Your research data is stored in:
- `projects/` - Individual study data
- `shared/` - Cross-study aggregations

**Recommended:** Backup these directories separately using:
- Private Git repository
- Encrypted cloud storage
- Local encrypted backup drive

## Sharing Research Findings

To share insights without raw data:

1. Export from the UI (when feature is added)
2. Generate PDF reports
3. Share aggregated statistics only
4. Create presentation slides from key insights

## Questions?

- **Where is my data?** All in `projects/` and `shared/` directories
- **Is it encrypted?** File system level encryption recommended (BitLocker, FileVault)
- **Can I delete it?** Yes, just delete the project folder
- **How do I move it?** Copy the entire `projects/` and `shared/` directories

## Security Checklist

- [ ] `.env` file is in `.gitignore` (contains API keys)
- [ ] `projects/*/` directories are in `.gitignore`
- [ ] `shared/*/*.json` and `*.md` files are in `.gitignore`
- [ ] Never commit actual research data
- [ ] Use environment-specific credentials
- [ ] Enable file system encryption for sensitive projects
- [ ] Regular backups to secure location

