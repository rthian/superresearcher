import express from 'express';
import { listProjects, getProjectDir, readInsights, readActions, readSharedPersonas } from '../../src/utils/files.js';
import fs from 'fs-extra';
import path from 'path';

const router = express.Router();

// GET /api/stats - Get dashboard statistics
router.get('/', async (req, res) => {
  try {
    const projects = await listProjects();
    
    let totalInsights = 0;
    let totalActions = 0;
    let openFeedback = 0;
    let actionsByStatus = {
      'Not Started': 0,
      'In Progress': 0,
      'Blocked': 0,
      'Complete': 0,
      'Cancelled': 0
    };
    let actionsByPriority = {
      'Critical': 0,
      'High': 0,
      'Medium': 0,
      'Low': 0
    };
    let actionsByDepartment = {};
    let insightsByCategory = {};
    let recentActivity = [];
    
    for (const projectSlug of projects) {
      try {
        const projectDir = getProjectDir(projectSlug);
        
        // Count insights
        const insightsPath = path.join(projectDir, 'insights', 'insights.json');
        if (await fs.pathExists(insightsPath)) {
          const insightsData = await fs.readJson(insightsPath);
          if (insightsData.insights) {
            totalInsights += insightsData.insights.length;
            
            // Count by category
            insightsData.insights.forEach(insight => {
              const category = insight.category || 'Uncategorized';
              insightsByCategory[category] = (insightsByCategory[category] || 0) + 1;
            });
            
            // Add to recent activity
            if (insightsData.extractedAt) {
              recentActivity.push({
                type: 'insights_extracted',
                project: projectSlug,
                timestamp: insightsData.extractedAt,
                count: insightsData.insights.length
              });
            }
          }
        }
        
        // Count actions
        const actionsPath = path.join(projectDir, 'actions', 'actions.json');
        if (await fs.pathExists(actionsPath)) {
          const actionsData = await fs.readJson(actionsPath);
          if (actionsData.actions) {
            totalActions += actionsData.actions.length;
            
            // Count by status, priority, department
            actionsData.actions.forEach(action => {
              const status = action.status || 'Not Started';
              const priority = action.priority || 'Medium';
              const department = action.department || 'Unassigned';
              
              actionsByStatus[status] = (actionsByStatus[status] || 0) + 1;
              actionsByPriority[priority] = (actionsByPriority[priority] || 0) + 1;
              actionsByDepartment[department] = (actionsByDepartment[department] || 0) + 1;
            });
            
            // Add to recent activity
            if (actionsData.generatedAt) {
              recentActivity.push({
                type: 'actions_generated',
                project: projectSlug,
                timestamp: actionsData.generatedAt,
                count: actionsData.actions.length
              });
            }
          }
        }
        
        // Count feedback
        const feedbackPath = path.join(projectDir, 'feedback.json');
        if (await fs.pathExists(feedbackPath)) {
          const feedbackData = await fs.readJson(feedbackPath);
          if (feedbackData.feedbackItems) {
            openFeedback += feedbackData.feedbackItems.filter(f => f.status === 'open').length;
          }
        }
      } catch (err) {
        console.error(`Error processing project ${projectSlug}:`, err);
      }
    }
    
    // Get personas count
    const personasData = await readSharedPersonas();
    const totalPersonas = personasData.personas?.length || 0;
    
    // Sort recent activity by timestamp
    recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    recentActivity = recentActivity.slice(0, 10); // Last 10 activities
    
    // Get high-impact insights (across all projects)
    const highImpactInsights = [];
    for (const projectSlug of projects) {
      try {
        const insightsData = await readInsights(projectSlug);
        if (insightsData.insights) {
          const highImpact = insightsData.insights
            .filter(i => i.impactLevel === 'High')
            .map(i => ({ ...i, projectSlug }));
          highImpactInsights.push(...highImpact);
        }
      } catch (err) {
        // Skip
      }
    }
    
    // Sort by confidence and take top 5
    highImpactInsights.sort((a, b) => {
      const confidenceOrder = { High: 3, Medium: 2, Low: 1 };
      return (confidenceOrder[b.confidenceLevel] || 0) - (confidenceOrder[a.confidenceLevel] || 0);
    });
    
    res.json({
      totalProjects: projects.length,
      totalInsights,
      totalActions,
      totalPersonas,
      openFeedback,
      actionsByStatus,
      actionsByPriority,
      actionsByDepartment,
      insightsByCategory,
      recentActivity,
      highImpactInsights: highImpactInsights.slice(0, 5)
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

export default router;

