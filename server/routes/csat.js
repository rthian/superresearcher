import express from 'express';
import { getSharedDir } from '../../src/utils/files.js';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// POST /api/csat/submit - Submit CSAT survey response
router.post('/submit', async (req, res) => {
  try {
    const sharedDir = getSharedDir();
    const csatPath = path.join(sharedDir, 'csat-responses.json');
    const statePath = path.join(sharedDir, 'csat-state.json');
    
    // Read existing responses or create new structure
    let data = { responses: [], aggregates: {} };
    if (await fs.pathExists(csatPath)) {
      data = await fs.readJson(csatPath);
    }
    
    const response = {
      id: uuidv4(),
      ...req.body,
      submittedAt: new Date().toISOString()
    };
    
    data.responses.push(response);
    
    // Recalculate aggregates
    data.aggregates = calculateAggregates(data.responses);
    
    await fs.ensureDir(path.dirname(csatPath));
    await fs.writeJson(csatPath, data, { spaces: 2 });
    
    // Update user state
    let stateData = { userStates: {} };
    if (await fs.pathExists(statePath)) {
      stateData = await fs.readJson(statePath);
    }
    
    const userId = req.body.userId;
    if (!stateData.userStates[userId]) {
      stateData.userStates[userId] = {
        lastSurveyDate: null,
        surveyedProjects: [],
        totalSurveys: 0,
        dismissedCount: 0,
        nextReminderDate: null
      };
    }
    
    stateData.userStates[userId].lastSurveyDate = new Date().toISOString();
    stateData.userStates[userId].totalSurveys++;
    
    // Add project to surveyed list if not already there
    const projectSlug = req.body.context?.projectSlug;
    if (projectSlug && !stateData.userStates[userId].surveyedProjects.includes(projectSlug)) {
      stateData.userStates[userId].surveyedProjects.push(projectSlug);
    }
    
    // Set next reminder date (30 days from now)
    const nextReminder = new Date();
    nextReminder.setDate(nextReminder.getDate() + 30);
    stateData.userStates[userId].nextReminderDate = nextReminder.toISOString();
    
    await fs.writeJson(statePath, stateData, { spaces: 2 });
    
    res.json({ success: true, response });
  } catch (error) {
    console.error('Error submitting CSAT:', error);
    res.status(500).json({ error: 'Failed to submit CSAT' });
  }
});

// GET /api/csat/should-show - Check if survey should be shown to user
router.get('/should-show', async (req, res) => {
  try {
    const { userId, projectSlug } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const sharedDir = getSharedDir();
    const statePath = path.join(sharedDir, 'csat-state.json');
    
    let stateData = { userStates: {} };
    if (await fs.pathExists(statePath)) {
      stateData = await fs.readJson(statePath);
    }
    
    const userState = stateData.userStates[userId] || {
      lastSurveyDate: null,
      surveyedProjects: [],
      totalSurveys: 0,
      dismissedCount: 0,
      nextReminderDate: null
    };
    
    let shouldShow = false;
    let reason = '';
    
    // Check if user has dismissed too many times
    if (userState.dismissedCount >= 3) {
      shouldShow = false;
      reason = 'dismissed_threshold';
    }
    // Check if we have a next reminder date and it's passed
    else if (userState.nextReminderDate && new Date() > new Date(userState.nextReminderDate)) {
      shouldShow = true;
      reason = 'periodic_reminder';
    }
    // Check if this is a new project for the user
    else if (projectSlug && !userState.surveyedProjects.includes(projectSlug)) {
      shouldShow = true;
      reason = 'project_visit';
    }
    // Check if user hasn't been surveyed in 14+ days
    else if (!userState.lastSurveyDate || 
             (new Date() - new Date(userState.lastSurveyDate)) > 14 * 24 * 60 * 60 * 1000) {
      shouldShow = true;
      reason = 'time_threshold';
    }
    
    res.json({ shouldShow, reason, userState });
  } catch (error) {
    console.error('Error checking CSAT display:', error);
    res.status(500).json({ error: 'Failed to check CSAT display' });
  }
});

// POST /api/csat/dismiss - User dismissed the survey
router.post('/dismiss', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const sharedDir = getSharedDir();
    const statePath = path.join(sharedDir, 'csat-state.json');
    
    let stateData = { userStates: {} };
    if (await fs.pathExists(statePath)) {
      stateData = await fs.readJson(statePath);
    }
    
    if (!stateData.userStates[userId]) {
      stateData.userStates[userId] = {
        lastSurveyDate: null,
        surveyedProjects: [],
        totalSurveys: 0,
        dismissedCount: 0,
        nextReminderDate: null
      };
    }
    
    stateData.userStates[userId].dismissedCount++;
    
    // Set next reminder date (90 days if dismissed 3+ times, otherwise 7 days)
    const daysToAdd = stateData.userStates[userId].dismissedCount >= 3 ? 90 : 7;
    const nextReminder = new Date();
    nextReminder.setDate(nextReminder.getDate() + daysToAdd);
    stateData.userStates[userId].nextReminderDate = nextReminder.toISOString();
    
    await fs.ensureDir(path.dirname(statePath));
    await fs.writeJson(statePath, stateData, { spaces: 2 });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error dismissing CSAT:', error);
    res.status(500).json({ error: 'Failed to dismiss CSAT' });
  }
});

// POST /api/csat/remind-later - User chose "remind me later"
router.post('/remind-later', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const sharedDir = getSharedDir();
    const statePath = path.join(sharedDir, 'csat-state.json');
    
    let stateData = { userStates: {} };
    if (await fs.pathExists(statePath)) {
      stateData = await fs.readJson(statePath);
    }
    
    if (!stateData.userStates[userId]) {
      stateData.userStates[userId] = {
        lastSurveyDate: null,
        surveyedProjects: [],
        totalSurveys: 0,
        dismissedCount: 0,
        nextReminderDate: null
      };
    }
    
    // Set reminder for 7 days from now
    const nextReminder = new Date();
    nextReminder.setDate(nextReminder.getDate() + 7);
    stateData.userStates[userId].nextReminderDate = nextReminder.toISOString();
    
    await fs.ensureDir(path.dirname(statePath));
    await fs.writeJson(statePath, stateData, { spaces: 2 });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error setting CSAT reminder:', error);
    res.status(500).json({ error: 'Failed to set reminder' });
  }
});

// GET /api/admin/csat/aggregates - Get CSAT aggregates (admin only)
router.get('/aggregates', async (req, res) => {
  try {
    const sharedDir = getSharedDir();
    const csatPath = path.join(sharedDir, 'csat-responses.json');
    
    if (!await fs.pathExists(csatPath)) {
      return res.json({ aggregates: {}, totalResponses: 0 });
    }
    
    const data = await fs.readJson(csatPath);
    
    res.json({
      aggregates: data.aggregates || {},
      totalResponses: data.responses?.length || 0
    });
  } catch (error) {
    console.error('Error getting CSAT aggregates:', error);
    res.status(500).json({ error: 'Failed to get aggregates' });
  }
});

// GET /api/admin/csat/trend - Get CSAT trend data
router.get('/trend', async (req, res) => {
  try {
    const { months = 12 } = req.query;
    const sharedDir = getSharedDir();
    const csatPath = path.join(sharedDir, 'csat-responses.json');
    
    if (!await fs.pathExists(csatPath)) {
      return res.json({ trend: [] });
    }
    
    const data = await fs.readJson(csatPath);
    const trend = data.aggregates?.trend || [];
    
    // Return last N months
    res.json({ trend: trend.slice(-parseInt(months)) });
  } catch (error) {
    console.error('Error getting CSAT trend:', error);
    res.status(500).json({ error: 'Failed to get trend' });
  }
});

// GET /api/admin/csat/by-project - Get CSAT by project
router.get('/by-project', async (req, res) => {
  try {
    const sharedDir = getSharedDir();
    const csatPath = path.join(sharedDir, 'csat-responses.json');
    
    if (!await fs.pathExists(csatPath)) {
      return res.json({ byProject: {} });
    }
    
    const data = await fs.readJson(csatPath);
    
    res.json({ byProject: data.aggregates?.byProject || {} });
  } catch (error) {
    console.error('Error getting CSAT by project:', error);
    res.status(500).json({ error: 'Failed to get data' });
  }
});

// GET /api/admin/csat/by-role - Get CSAT by user role
router.get('/by-role', async (req, res) => {
  try {
    const sharedDir = getSharedDir();
    const csatPath = path.join(sharedDir, 'csat-responses.json');
    
    if (!await fs.pathExists(csatPath)) {
      return res.json({ byRole: {} });
    }
    
    const data = await fs.readJson(csatPath);
    
    res.json({ byRole: data.aggregates?.byRole || {} });
  } catch (error) {
    console.error('Error getting CSAT by role:', error);
    res.status(500).json({ error: 'Failed to get data' });
  }
});

// GET /api/admin/csat/verbatims - Get open feedback comments
router.get('/verbatims', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const sharedDir = getSharedDir();
    const csatPath = path.join(sharedDir, 'csat-responses.json');
    
    if (!await fs.pathExists(csatPath)) {
      return res.json({ verbatims: [] });
    }
    
    const data = await fs.readJson(csatPath);
    
    // Get responses with feedback
    const verbatims = (data.responses || [])
      .filter(r => r.openFeedback && r.openFeedback.trim() !== '')
      .map(r => ({
        feedback: r.openFeedback,
        role: r.userRole,
        score: r.scores?.overallSatisfaction,
        submittedAt: r.submittedAt
      }))
      .slice(-parseInt(limit));
    
    res.json({ verbatims });
  } catch (error) {
    console.error('Error getting CSAT verbatims:', error);
    res.status(500).json({ error: 'Failed to get verbatims' });
  }
});

// Helper function to calculate aggregates
function calculateAggregates(responses) {
  if (!responses || responses.length === 0) {
    return {
      totalResponses: 0,
      averageCSAT: 0,
      npsScore: 0,
      lastCalculated: new Date().toISOString()
    };
  }
  
  const totalResponses = responses.length;
  
  // Calculate average CSAT
  const avgCSAT = responses.reduce((sum, r) => 
    sum + (r.scores?.overallSatisfaction || 0), 0) / totalResponses;
  
  // Calculate NPS (Net Promoter Score)
  const npsScores = responses.map(r => r.npsScore).filter(s => s !== undefined && s !== null);
  const promoters = npsScores.filter(s => s >= 9).length;
  const detractors = npsScores.filter(s => s <= 6).length;
  const npsScore = npsScores.length > 0 
    ? Math.round(((promoters - detractors) / npsScores.length) * 100)
    : 0;
  
  // By role
  const byRole = {};
  responses.forEach(r => {
    const role = r.userRole || 'Unknown';
    if (!byRole[role]) {
      byRole[role] = { avgCSAT: 0, count: 0, nps: 0, scores: [] };
    }
    byRole[role].count++;
    byRole[role].scores.push(r.scores?.overallSatisfaction || 0);
    if (r.npsScore !== undefined && r.npsScore !== null) {
      byRole[role].nps += r.npsScore >= 9 ? 1 : (r.npsScore <= 6 ? -1 : 0);
    }
  });
  
  Object.keys(byRole).forEach(role => {
    const roleData = byRole[role];
    roleData.avgCSAT = roleData.scores.reduce((a, b) => a + b, 0) / roleData.count;
    roleData.nps = Math.round((roleData.nps / roleData.count) * 100);
    delete roleData.scores; // Remove temporary array
  });
  
  // By project
  const byProject = {};
  responses.forEach(r => {
    const project = r.context?.projectSlug || 'Unknown';
    if (!byProject[project]) {
      byProject[project] = { avgCSAT: 0, count: 0, nps: 0, scores: [] };
    }
    byProject[project].count++;
    byProject[project].scores.push(r.scores?.overallSatisfaction || 0);
    if (r.npsScore !== undefined && r.npsScore !== null) {
      byProject[project].nps += r.npsScore >= 9 ? 1 : (r.npsScore <= 6 ? -1 : 0);
    }
  });
  
  Object.keys(byProject).forEach(project => {
    const projData = byProject[project];
    projData.avgCSAT = projData.scores.reduce((a, b) => a + b, 0) / projData.count;
    projData.nps = Math.round((projData.nps / projData.count) * 100);
    delete projData.scores;
  });
  
  // Trend by month (last 12 months)
  const trend = [];
  const monthlyData = {};
  
  responses.forEach(r => {
    const date = new Date(r.submittedAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { scores: [], npsScores: [] };
    }
    monthlyData[monthKey].scores.push(r.scores?.overallSatisfaction || 0);
    if (r.npsScore !== undefined && r.npsScore !== null) {
      monthlyData[monthKey].npsScores.push(r.npsScore);
    }
  });
  
  Object.keys(monthlyData).sort().forEach(month => {
    const data = monthlyData[month];
    const avgCSAT = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
    const promoters = data.npsScores.filter(s => s >= 9).length;
    const detractors = data.npsScores.filter(s => s <= 6).length;
    const nps = data.npsScores.length > 0
      ? Math.round(((promoters - detractors) / data.npsScores.length) * 100)
      : 0;
    
    trend.push({
      month,
      avgCSAT: parseFloat(avgCSAT.toFixed(2)),
      npsScore: nps,
      responses: data.scores.length
    });
  });
  
  return {
    totalResponses,
    averageCSAT: parseFloat(avgCSAT.toFixed(2)),
    npsScore,
    lastCalculated: new Date().toISOString(),
    byRole,
    byProject,
    trend
  };
}

export default router;

