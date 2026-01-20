import express from 'express';
import { listProjects, getProjectDir } from '../../src/utils/files.js';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET /api/feedback - Get all feedback (with filters)
router.get('/', async (req, res) => {
  try {
    const { status, type, projectSlug } = req.query;
    const projects = projectSlug ? [projectSlug] : await listProjects();
    
    const allFeedback = [];
    
    for (const slug of projects) {
      try {
        const projectDir = getProjectDir(slug);
        const feedbackPath = path.join(projectDir, 'feedback.json');
        
        if (await fs.pathExists(feedbackPath)) {
          const feedbackData = await fs.readJson(feedbackPath);
          if (feedbackData.feedbackItems) {
            const enrichedItems = feedbackData.feedbackItems.map(item => ({
              ...item,
              projectSlug: slug
            }));
            allFeedback.push(...enrichedItems);
          }
        }
      } catch (err) {
        console.error(`Error reading feedback for ${slug}:`, err);
      }
    }
    
    // Apply filters
    let filtered = allFeedback;
    if (status) {
      filtered = filtered.filter(f => f.status === status);
    }
    if (type) {
      filtered = filtered.filter(f => f.type === type);
    }
    
    // Sort by createdAt (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({ feedbackItems: filtered, totalCount: filtered.length });
  } catch (error) {
    console.error('Error getting feedback:', error);
    res.status(500).json({ error: 'Failed to get feedback' });
  }
});

// POST /api/feedback - Create new feedback
router.post('/', async (req, res) => {
  try {
    const { projectSlug, ...feedbackData } = req.body;
    
    if (!projectSlug) {
      return res.status(400).json({ error: 'projectSlug is required' });
    }
    
    const projectDir = getProjectDir(projectSlug);
    const feedbackPath = path.join(projectDir, 'feedback.json');
    
    // Read existing feedback or create new structure
    let data = { feedbackItems: [] };
    if (await fs.pathExists(feedbackPath)) {
      data = await fs.readJson(feedbackPath);
    }
    
    const newFeedback = {
      id: uuidv4(),
      ...feedbackData,
      createdAt: new Date().toISOString(),
      responses: []
    };
    
    data.feedbackItems.push(newFeedback);
    
    await fs.ensureDir(path.dirname(feedbackPath));
    await fs.writeJson(feedbackPath, data, { spaces: 2 });
    
    res.json({ success: true, feedback: newFeedback });
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ error: 'Failed to create feedback' });
  }
});

// GET /api/feedback/:id - Get specific feedback
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { projectSlug } = req.query;
    
    if (!projectSlug) {
      return res.status(400).json({ error: 'projectSlug query parameter is required' });
    }
    
    const projectDir = getProjectDir(projectSlug);
    const feedbackPath = path.join(projectDir, 'feedback.json');
    
    if (!await fs.pathExists(feedbackPath)) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    const data = await fs.readJson(feedbackPath);
    const feedback = data.feedbackItems.find(f => f.id === id);
    
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    res.json({ feedback });
  } catch (error) {
    console.error('Error getting feedback:', error);
    res.status(500).json({ error: 'Failed to get feedback' });
  }
});

// PUT /api/feedback/:id - Update feedback
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { projectSlug, ...updates } = req.body;
    
    if (!projectSlug) {
      return res.status(400).json({ error: 'projectSlug is required' });
    }
    
    const projectDir = getProjectDir(projectSlug);
    const feedbackPath = path.join(projectDir, 'feedback.json');
    
    if (!await fs.pathExists(feedbackPath)) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    const data = await fs.readJson(feedbackPath);
    const feedbackIndex = data.feedbackItems.findIndex(f => f.id === id);
    
    if (feedbackIndex === -1) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    data.feedbackItems[feedbackIndex] = {
      ...data.feedbackItems[feedbackIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await fs.writeJson(feedbackPath, data, { spaces: 2 });
    
    res.json({ success: true, feedback: data.feedbackItems[feedbackIndex] });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ error: 'Failed to update feedback' });
  }
});

// DELETE /api/feedback/:id - Delete feedback
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { projectSlug } = req.query;
    
    if (!projectSlug) {
      return res.status(400).json({ error: 'projectSlug query parameter is required' });
    }
    
    const projectDir = getProjectDir(projectSlug);
    const feedbackPath = path.join(projectDir, 'feedback.json');
    
    if (!await fs.pathExists(feedbackPath)) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    const data = await fs.readJson(feedbackPath);
    const initialLength = data.feedbackItems.length;
    data.feedbackItems = data.feedbackItems.filter(f => f.id !== id);
    
    if (data.feedbackItems.length === initialLength) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    await fs.writeJson(feedbackPath, data, { spaces: 2 });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

// POST /api/feedback/:id/respond - Add response to feedback
router.post('/:id/respond', async (req, res) => {
  try {
    const { id } = req.params;
    const { projectSlug, author, authorName, content } = req.body;
    
    if (!projectSlug) {
      return res.status(400).json({ error: 'projectSlug is required' });
    }
    
    const projectDir = getProjectDir(projectSlug);
    const feedbackPath = path.join(projectDir, 'feedback.json');
    
    if (!await fs.pathExists(feedbackPath)) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    const data = await fs.readJson(feedbackPath);
    const feedbackIndex = data.feedbackItems.findIndex(f => f.id === id);
    
    if (feedbackIndex === -1) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    const response = {
      id: uuidv4(),
      author,
      authorName,
      content,
      createdAt: new Date().toISOString()
    };
    
    if (!data.feedbackItems[feedbackIndex].responses) {
      data.feedbackItems[feedbackIndex].responses = [];
    }
    
    data.feedbackItems[feedbackIndex].responses.push(response);
    
    await fs.writeJson(feedbackPath, data, { spaces: 2 });
    
    res.json({ success: true, response });
  } catch (error) {
    console.error('Error adding response:', error);
    res.status(500).json({ error: 'Failed to add response' });
  }
});

export default router;

