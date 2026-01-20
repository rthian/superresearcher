import express from 'express';
import {
  listProjects,
  getProjectDir,
  projectExists,
  readProjectConfig,
  readStudyMetadata,
  readMethodology,
  writeProjectConfig
} from '../../src/utils/files.js';
import fs from 'fs-extra';
import path from 'path';

const router = express.Router();

// GET /api/projects - List all projects
router.get('/', async (req, res) => {
  try {
    const projects = await listProjects();
    
    // Enrich with metadata
    const enrichedProjects = await Promise.all(
      projects.map(async (slug) => {
        try {
          const config = await readProjectConfig(slug);
          const projectDir = getProjectDir(slug);
          
          // Count insights and actions
          const insightsPath = path.join(projectDir, 'insights', 'insights.json');
          const actionsPath = path.join(projectDir, 'actions', 'actions.json');
          const feedbackPath = path.join(projectDir, 'feedback.json');
          
          let insightsCount = 0;
          let actionsCount = 0;
          let feedbackCount = 0;
          
          if (await fs.pathExists(insightsPath)) {
            const insights = await fs.readJson(insightsPath);
            insightsCount = insights.insights?.length || 0;
          }
          
          if (await fs.pathExists(actionsPath)) {
            const actions = await fs.readJson(actionsPath);
            actionsCount = actions.actions?.length || 0;
          }
          
          if (await fs.pathExists(feedbackPath)) {
            const feedback = await fs.readJson(feedbackPath);
            feedbackCount = feedback.feedbackItems?.filter(f => f.status === 'open').length || 0;
          }
          
          return {
            slug,
            ...config,
            metrics: {
              insights: insightsCount,
              actions: actionsCount,
              feedbackOpen: feedbackCount
            }
          };
        } catch (err) {
          console.error(`Error enriching project ${slug}:`, err);
          return { slug, error: 'Failed to load project data' };
        }
      })
    );
    
    res.json({ projects: enrichedProjects });
  } catch (error) {
    console.error('Error listing projects:', error);
    res.status(500).json({ error: 'Failed to list projects' });
  }
});

// GET /api/projects/:slug - Get project details
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    if (!await projectExists(slug)) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const config = await readProjectConfig(slug);
    const studyMetadata = await readStudyMetadata(slug);
    const methodology = await readMethodology(slug);
    
    res.json({
      slug,
      ...config,
      studyMetadata,
      methodology
    });
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({ error: 'Failed to get project' });
  }
});

// PUT /api/projects/:slug - Update project config
router.put('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    if (!await projectExists(slug)) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const currentConfig = await readProjectConfig(slug);
    const updatedConfig = {
      ...currentConfig,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await writeProjectConfig(slug, updatedConfig);
    
    res.json({ success: true, config: updatedConfig });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// GET /api/projects/:slug/insights - Get project insights
router.get('/:slug/insights', async (req, res) => {
  try {
    const { slug } = req.params;
    
    if (!await projectExists(slug)) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const projectDir = getProjectDir(slug);
    const insightsPath = path.join(projectDir, 'insights', 'insights.json');
    
    if (!await fs.pathExists(insightsPath)) {
      return res.json({ insights: [], extractedAt: null, studyId: slug });
    }
    
    const data = await fs.readJson(insightsPath);
    res.json(data);
  } catch (error) {
    console.error('Error getting project insights:', error);
    res.status(500).json({ error: 'Failed to get insights' });
  }
});

// PUT /api/projects/:slug/insights - Update project insights
router.put('/:slug/insights', async (req, res) => {
  try {
    const { slug } = req.params;
    
    if (!await projectExists(slug)) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const projectDir = getProjectDir(slug);
    const insightsPath = path.join(projectDir, 'insights', 'insights.json');
    
    await fs.ensureDir(path.dirname(insightsPath));
    await fs.writeJson(insightsPath, req.body, { spaces: 2 });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating project insights:', error);
    res.status(500).json({ error: 'Failed to update insights' });
  }
});

// GET /api/projects/:slug/actions - Get project actions
router.get('/:slug/actions', async (req, res) => {
  try {
    const { slug } = req.params;
    
    if (!await projectExists(slug)) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const projectDir = getProjectDir(slug);
    const actionsPath = path.join(projectDir, 'actions', 'actions.json');
    
    if (!await fs.pathExists(actionsPath)) {
      return res.json({ actions: [], generatedAt: null, studyId: slug });
    }
    
    const data = await fs.readJson(actionsPath);
    res.json(data);
  } catch (error) {
    console.error('Error getting project actions:', error);
    res.status(500).json({ error: 'Failed to get actions' });
  }
});

// PUT /api/projects/:slug/actions - Update project actions
router.put('/:slug/actions', async (req, res) => {
  try {
    const { slug } = req.params;
    
    if (!await projectExists(slug)) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const projectDir = getProjectDir(slug);
    const actionsPath = path.join(projectDir, 'actions', 'actions.json');
    
    await fs.ensureDir(path.dirname(actionsPath));
    await fs.writeJson(actionsPath, req.body, { spaces: 2 });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating project actions:', error);
    res.status(500).json({ error: 'Failed to update actions' });
  }
});

// GET /api/projects/:slug/feedback - Get project feedback
router.get('/:slug/feedback', async (req, res) => {
  try {
    const { slug } = req.params;
    
    if (!await projectExists(slug)) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const projectDir = getProjectDir(slug);
    const feedbackPath = path.join(projectDir, 'feedback.json');
    
    if (!await fs.pathExists(feedbackPath)) {
      return res.json({ feedbackItems: [] });
    }
    
    const data = await fs.readJson(feedbackPath);
    res.json(data);
  } catch (error) {
    console.error('Error getting project feedback:', error);
    res.status(500).json({ error: 'Failed to get feedback' });
  }
});

export default router;

