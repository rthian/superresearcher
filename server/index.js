import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import projectsRouter from './routes/projects.js';
import insightsRouter from './routes/insights.js';
import actionsRouter from './routes/actions.js';
import personasRouter from './routes/personas.js';
import statsRouter from './routes/stats.js';
import feedbackRouter from './routes/feedback.js';
import suggestionsRouter from './routes/suggestions.js';
import csatRouter from './routes/csat.js';
import roiRouter from './routes/roi.js';
import competitiveRouter from './routes/competitive.js';
import { authMiddleware, adminOnly, roleInfoEndpoint } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth middleware (disabled by default; set AUTH_MODE=token in .env to enable)
app.use('/api', authMiddleware);

// Role info endpoint (UI calls this to adapt)
app.get('/api/auth/role', roleInfoEndpoint);

// Debug endpoint
app.get('/api/debug/info', (req, res) => {
  res.json({
    cwd: process.cwd(),
    projectsPath: path.join(process.cwd(), 'projects'),
    nodeEnv: process.env.NODE_ENV,
    authMode: process.env.AUTH_MODE || 'disabled',
    role: req.userRole,
  });
});

// API Routes -- read-only (all roles)
app.use('/api/projects', projectsRouter);
app.use('/api/insights', insightsRouter);
app.use('/api/actions', actionsRouter);
app.use('/api/personas', personasRouter);
app.use('/api/stats', statsRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/research-suggestions', suggestionsRouter);
app.use('/api/csat', csatRouter);
app.use('/api/roi', roiRouter);
app.use('/api/competitive', competitiveRouter);

// Admin-only routes (write operations)
app.use('/api/admin/csat', adminOnly, csatRouter);

// Serve static UI files (will be built by Vite)
const uiDistPath = path.join(__dirname, '../ui/dist');
app.use(express.static(uiDistPath));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(uiDistPath, 'index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

export function startServer(port = 3000) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`SuperResearcher UI server running on http://localhost:${port}`);
      resolve(server);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use`);
        reject(err);
      } else {
        reject(err);
      }
    });
  });
}

export default app;

