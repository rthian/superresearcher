# SuperResearcher Web UI

A modern React-based web interface for exploring research projects, insights, actions, and personas.

## Quick Start

### 1. Install Dependencies

```bash
# Install backend dependencies (if not already done)
npm install

# Install UI dependencies
cd ui
npm install
cd ..
```

### 2. Start the Server

```bash
# From the root directory
superresearcher serve
```

Or specify a custom port:

```bash
superresearcher serve --port 3001
```

The UI will automatically open in your browser at `http://localhost:3000`

## Development Mode

For UI development with hot reload:

```bash
# Terminal 1: Start the backend API server (from root)
node server/index.js

# Terminal 2: Start the Vite dev server (from ui/)
cd ui
npm run dev
```

The Vite dev server will run at `http://localhost:5173` and proxy API requests to `http://localhost:3000`

## Building for Production

```bash
cd ui
npm run build
```

This creates optimized production files in `ui/dist/` which are served by the Express server.

## Features

### Dashboard
- At-a-glance overview of research health
- Stats cards showing total projects, insights, actions, and personas
- Recent activity feed
- High-impact insights showcase
- Actions breakdown by status

### Projects Library
- Browse all research studies
- View project metrics (insights, actions, feedback counts)
- Filter and search projects
- Quick access to project details

### Insights Explorer
- Search across all insights from all projects
- Filter by category, impact level, confidence
- View supporting evidence and quotes
- Rate insight quality
- Link to source projects

### Action Center
- Manage action items from all projects
- View by status, priority, department
- Update action status and assignments
- Track implementation progress
- Discussion threads on actions

### Persona Gallery
- View customer personas derived from research
- See supporting insights for each persona
- Track confidence scores
- Manage persona attributes

### Feedback Inbox
- Centralized feedback management
- Quality issue tracking
- Respond to team feedback
- Mark items as addressed or dismissed

### Research Suggestions Board
- Crowdsource future research ideas
- Vote on suggestions
- Comment and discuss
- Track suggestion status (proposed, planned, in progress, complete)

### Admin Analytics (CSAT)
- Overall satisfaction scores
- Net Promoter Score (NPS)
- CSAT breakdown by role and project
- Recent user feedback verbatims
- Trend analysis over time

## Architecture

```
superresearcher/
├── server/                 # Express API server
│   ├── index.js           # Server entry point
│   └── routes/            # API route handlers
│       ├── projects.js
│       ├── insights.js
│       ├── actions.js
│       ├── personas.js
│       ├── stats.js
│       ├── feedback.js
│       ├── suggestions.js
│       └── csat.js
├── ui/                    # React frontend
│   ├── src/
│   │   ├── main.jsx       # Entry point
│   │   ├── App.jsx        # Root component with routing
│   │   ├── api/           # API client modules
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Route pages
│   │   └── utils/         # Helper functions
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── src/                   # CLI commands
    └── commands/
        └── serve.js       # Web UI server command
```

## Technology Stack

### Backend
- **Express.js** - Web server and API
- **CORS** - Cross-origin resource sharing
- **File system** - Data persistence (JSON files)

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **TanStack Query** - Server state management
- **Tailwind CSS** - Utility-first styling
- **React Icons** - Icon library
- **React Hot Toast** - Notifications
- **Recharts** - Data visualization

## API Endpoints

All endpoints are prefixed with `/api`

### Projects
- `GET /projects` - List all projects
- `GET /projects/:slug` - Get project details
- `GET /projects/:slug/insights` - Get project insights
- `PUT /projects/:slug/insights` - Update insights
- `GET /projects/:slug/actions` - Get project actions
- `PUT /projects/:slug/actions` - Update actions
- `GET /projects/:slug/feedback` - Get project feedback

### Insights
- `GET /insights` - Get all insights across projects
- `POST /insights/:id/rate` - Rate an insight
- `GET /insights/:id/ratings` - Get insight ratings

### Actions
- `GET /actions` - Get all actions
- `PUT /actions/:id` - Update an action

### Personas
- `GET /personas` - Get all personas
- `POST /personas` - Create a persona
- `PUT /personas/:id` - Update a persona

### Feedback
- `GET /feedback` - List feedback (with filters)
- `POST /feedback` - Create feedback
- `PUT /feedback/:id` - Update feedback
- `POST /feedback/:id/respond` - Respond to feedback

### Research Suggestions
- `GET /research-suggestions` - List suggestions
- `POST /research-suggestions` - Create suggestion
- `PUT /research-suggestions/:id/vote` - Vote on suggestion
- `PUT /research-suggestions/:id/status` - Update status
- `POST /research-suggestions/:id/comment` - Add comment

### CSAT
- `POST /csat/submit` - Submit CSAT survey
- `GET /csat/should-show` - Check if survey should show
- `GET /admin/csat/aggregates` - Get aggregate metrics
- `GET /admin/csat/trend` - Get trend data
- `GET /admin/csat/by-project` - Get scores by project
- `GET /admin/csat/by-role` - Get scores by role
- `GET /admin/csat/verbatims` - Get feedback comments

### Stats
- `GET /stats` - Get dashboard statistics

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Optional: Notion integration
NOTION_API_KEY=your_notion_api_key
NOTION_INSIGHTS_DATABASE_ID=your_database_id
NOTION_ACTIONS_DATABASE_ID=your_database_id
```

### Port Configuration

Default ports:
- API Server: `3000`
- Vite Dev Server: `5173`

Change the API port:
```bash
superresearcher serve --port 3001
```

## Troubleshooting

### Port Already in Use

```bash
# Use a different port
superresearcher serve --port 3001
```

### UI Not Loading

1. Check that both backend and frontend are running
2. Verify API proxy configuration in `ui/vite.config.js`
3. Clear browser cache and reload

### API Errors

1. Check that projects directory exists and has correct structure
2. Verify JSON files are valid
3. Check server logs for detailed error messages

### Build Errors

```bash
# Clean and reinstall dependencies
cd ui
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Contributing

The UI follows React best practices:
- Functional components with hooks
- Centralized API client
- Utility-first styling with Tailwind
- Component-based architecture
- Consistent file organization

## License

MIT License - See LICENSE file for details

