import express from 'express';
import { listProjects, getProjectDir, readActions } from '../../src/utils/files.js';
import fs from 'fs-extra';
import path from 'path';

const router = express.Router();

// GET /api/actions - Get all actions across all projects
router.get('/', async (req, res) => {
  try {
    const projects = await listProjects();
    const allActions = [];
    
    for (const projectSlug of projects) {
      try {
        const actionsData = await readActions(projectSlug);
        
        // Read project config to get organization
        const projectDir = getProjectDir(projectSlug);
        const configPath = path.join(projectDir, 'study.config.json');
        let organization = null;
        
        if (await fs.pathExists(configPath)) {
          const config = await fs.readJson(configPath);
          organization = config.organization || null;
        }
        
        if (actionsData.actions && Array.isArray(actionsData.actions)) {
          // Add project context and organization to each action
          const enrichedActions = actionsData.actions.map(action => ({
            ...action,
            projectSlug,
            studyId: actionsData.studyId,
            organization
          }));
          allActions.push(...enrichedActions);
        }
      } catch (err) {
        console.error(`Error reading actions for ${projectSlug}:`, err);
      }
    }
    
    res.json({ actions: allActions, totalCount: allActions.length });
  } catch (error) {
    console.error('Error getting all actions:', error);
    res.status(500).json({ error: 'Failed to get actions' });
  }
});

// PUT /api/actions/:id - Update a specific action
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { projectSlug, ...updates } = req.body;
    
    if (!projectSlug) {
      return res.status(400).json({ error: 'projectSlug is required' });
    }
    
    const projectDir = getProjectDir(projectSlug);
    const actionsPath = path.join(projectDir, 'actions', 'actions.json');
    
    if (!await fs.pathExists(actionsPath)) {
      return res.status(404).json({ error: 'Actions not found' });
    }
    
    const data = await fs.readJson(actionsPath);
    const actionIndex = data.actions.findIndex(a => a.id === id);
    
    if (actionIndex === -1) {
      return res.status(404).json({ error: 'Action not found' });
    }
    
    // Update the action
    data.actions[actionIndex] = {
      ...data.actions[actionIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await fs.writeJson(actionsPath, data, { spaces: 2 });
    
    res.json({ success: true, action: data.actions[actionIndex] });
  } catch (error) {
    console.error('Error updating action:', error);
    res.status(500).json({ error: 'Failed to update action' });
  }
});

export default router;

