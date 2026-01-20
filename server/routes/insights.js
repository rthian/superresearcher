import express from 'express';
import { listProjects, getProjectDir, readInsights } from '../../src/utils/files.js';
import fs from 'fs-extra';
import path from 'path';

const router = express.Router();

// GET /api/insights - Get all insights across all projects
router.get('/', async (req, res) => {
  try {
    const projects = await listProjects();
    const allInsights = [];
    
    for (const projectSlug of projects) {
      try {
        const insightsData = await readInsights(projectSlug);
        if (insightsData.insights && Array.isArray(insightsData.insights)) {
          // Add project context to each insight
          const enrichedInsights = insightsData.insights.map(insight => ({
            ...insight,
            projectSlug,
            studyId: insightsData.studyId
          }));
          allInsights.push(...enrichedInsights);
        }
      } catch (err) {
        console.error(`Error reading insights for ${projectSlug}:`, err);
      }
    }
    
    res.json({ insights: allInsights, totalCount: allInsights.length });
  } catch (error) {
    console.error('Error getting all insights:', error);
    res.status(500).json({ error: 'Failed to get insights' });
  }
});

// POST /api/insights/:id/rate - Rate an insight
router.post('/:id/rate', async (req, res) => {
  try {
    const { id } = req.params;
    const { projectSlug, userId, overallRating, evidenceStrength, actionability, clarity } = req.body;
    
    if (!projectSlug) {
      return res.status(400).json({ error: 'projectSlug is required' });
    }
    
    const projectDir = getProjectDir(projectSlug);
    const insightsPath = path.join(projectDir, 'insights', 'insights.json');
    
    if (!await fs.pathExists(insightsPath)) {
      return res.status(404).json({ error: 'Insights not found' });
    }
    
    const data = await fs.readJson(insightsPath);
    const insightIndex = data.insights.findIndex(i => i.id === id);
    
    if (insightIndex === -1) {
      return res.status(404).json({ error: 'Insight not found' });
    }
    
    // Initialize quality metrics if not present
    if (!data.insights[insightIndex].qualityMetrics) {
      data.insights[insightIndex].qualityMetrics = {
        averageRating: 0,
        ratingCount: 0,
        evidenceStrength: 0,
        actionability: 0,
        clarity: 0,
        ratings: []
      };
    }
    
    const metrics = data.insights[insightIndex].qualityMetrics;
    
    // Check if user already rated
    const existingRatingIndex = metrics.ratings.findIndex(r => r.userId === userId);
    
    const newRating = {
      userId,
      overallRating,
      evidenceStrength,
      actionability,
      clarity,
      createdAt: new Date().toISOString()
    };
    
    if (existingRatingIndex >= 0) {
      // Update existing rating
      metrics.ratings[existingRatingIndex] = newRating;
    } else {
      // Add new rating
      metrics.ratings.push(newRating);
    }
    
    // Recalculate averages
    const ratings = metrics.ratings;
    metrics.ratingCount = ratings.length;
    metrics.averageRating = ratings.reduce((sum, r) => sum + r.overallRating, 0) / ratings.length;
    metrics.evidenceStrength = ratings.reduce((sum, r) => sum + r.evidenceStrength, 0) / ratings.length;
    metrics.actionability = ratings.reduce((sum, r) => sum + r.actionability, 0) / ratings.length;
    metrics.clarity = ratings.reduce((sum, r) => sum + r.clarity, 0) / ratings.length;
    
    await fs.writeJson(insightsPath, data, { spaces: 2 });
    
    res.json({ success: true, qualityMetrics: metrics });
  } catch (error) {
    console.error('Error rating insight:', error);
    res.status(500).json({ error: 'Failed to rate insight' });
  }
});

// GET /api/insights/:id/ratings - Get insight ratings
router.get('/:id/ratings', async (req, res) => {
  try {
    const { id } = req.params;
    const { projectSlug } = req.query;
    
    if (!projectSlug) {
      return res.status(400).json({ error: 'projectSlug query parameter is required' });
    }
    
    const projectDir = getProjectDir(projectSlug);
    const insightsPath = path.join(projectDir, 'insights', 'insights.json');
    
    if (!await fs.pathExists(insightsPath)) {
      return res.status(404).json({ error: 'Insights not found' });
    }
    
    const data = await fs.readJson(insightsPath);
    const insight = data.insights.find(i => i.id === id);
    
    if (!insight) {
      return res.status(404).json({ error: 'Insight not found' });
    }
    
    res.json({ qualityMetrics: insight.qualityMetrics || null });
  } catch (error) {
    console.error('Error getting insight ratings:', error);
    res.status(500).json({ error: 'Failed to get ratings' });
  }
});

export default router;

