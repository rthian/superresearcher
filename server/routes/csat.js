import express from 'express';
import { getSharedDir, readCSATMetrics, writeCSATMetrics, parseCSATCSV } from '../../src/utils/files.js';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

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

// ============================================================================
// BANK CUSTOMER METRICS ENDPOINTS (GXS/GXB CSAT/NPS Tracking)
// ============================================================================

// GET /api/csat/metrics - Get all bank customer CSAT/NPS data
router.get('/metrics', async (req, res) => {
  try {
    const data = await readCSATMetrics();
    res.json(data);
  } catch (error) {
    console.error('Error getting CSAT metrics:', error);
    res.status(500).json({ error: 'Failed to get CSAT metrics' });
  }
});

// GET /api/csat/metrics/scores - Get specific scores with filtering
router.get('/metrics/scores', async (req, res) => {
  try {
    const { level, entity, period, dimension } = req.query;
    const data = await readCSATMetrics();
    
    if (!period) {
      return res.status(400).json({ error: 'period parameter is required' });
    }
    
    const periodData = data.periods.find(p => p.period === period);
    
    if (!periodData) {
      return res.status(404).json({ error: 'Period not found' });
    }
    
    let result = {};
    
    if (level === 'bank') {
      result = periodData.bankWide || {};
    } else if (level === 'organization' && entity) {
      result = periodData.byOrganization?.[entity] || {};
    } else if (level === 'product' && entity) {
      result = periodData.byProduct?.[entity] || {};
    } else if (level === 'dimension' && dimension) {
      result = periodData.byDimension?.[dimension] || {};
    } else {
      result = periodData;
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error getting scores:', error);
    res.status(500).json({ error: 'Failed to get scores' });
  }
});

// GET /api/csat/metrics/trends - Get trend data over time
router.get('/metrics/trends', async (req, res) => {
  try {
    const { entity, entityType, dimension, periods: numPeriods = 8 } = req.query;
    const data = await readCSATMetrics();
    
    // Sort periods by date
    const sortedPeriods = [...data.periods].sort((a, b) => 
      new Date(a.startDate) - new Date(b.startDate)
    );
    
    // Take last N periods
    const recentPeriods = sortedPeriods.slice(-parseInt(numPeriods));
    
    let trendData = [];
    
    if (entityType === 'bank') {
      trendData = recentPeriods.map(p => ({
        period: p.period,
        bankCSAT: p.bankWide?.csat?.score || null,
        nps: p.bankWide?.nps?.score || null,
        qoqChange: p.bankWide?.csat?.qoqChange || null,
        yoyChange: p.bankWide?.csat?.yoyChange || null
      }));
    } else if (entityType === 'organization' && entity) {
      trendData = recentPeriods.map(p => ({
        period: p.period,
        bankCSAT: p.byOrganization?.[entity]?.csat?.score || null,
        nps: p.byOrganization?.[entity]?.nps?.score || null,
        qoqChange: p.byOrganization?.[entity]?.csat?.qoqChange || null,
        yoyChange: p.byOrganization?.[entity]?.csat?.yoyChange || null
      }));
    } else if (entityType === 'product' && entity) {
      trendData = recentPeriods.map(p => ({
        period: p.period,
        score: p.byProduct?.[entity]?.csat?.score || null,
        nps: p.byProduct?.[entity]?.nps?.score || null
      }));
    } else if (entityType === 'dimension' && dimension) {
      trendData = recentPeriods.map(p => ({
        period: p.period,
        score: p.byDimension?.[dimension]?.score || null,
        benchmark: p.byDimension?.[dimension]?.benchmark || null
      }));
    }
    
    res.json({ trends: trendData });
  } catch (error) {
    console.error('Error getting trends:', error);
    res.status(500).json({ error: 'Failed to get trends' });
  }
});

// POST /api/csat/metrics/upload - Upload CSV/Excel with CSAT data
router.post('/metrics/upload', upload.single('file'), async (req, res) => {
  try {
    const { period, periodType, dataSource, organization } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    if (!period) {
      await fs.remove(req.file.path);
      return res.status(400).json({ error: 'period is required' });
    }
    
    const filePath = req.file.path;
    
    // Parse uploaded file
    const parsedData = await parseCSATCSV(filePath);
    
    // Get existing data
    const existingData = await readCSATMetrics();
    
    // Calculate start and end dates from period
    const { startDate, endDate } = calculatePeriodDates(period, periodType);
    
    // Aggregate the parsed data
    const aggregated = aggregateCSATData(parsedData, existingData);
    
    // Create new period entry
    const periodEntry = {
      id: uuidv4(),
      period,
      periodType: periodType || 'quarterly',
      startDate,
      endDate,
      collectedAt: new Date().toISOString(),
      dataSource: dataSource || 'manual_upload',
      organization: organization || null,
      ...aggregated,
      rawDataRows: parsedData.length
    };
    
    // Calculate QoQ and YoY changes
    calculateChanges(periodEntry, existingData.periods);
    
    // Generate alerts
    periodEntry.alerts = generateMetricAlerts(periodEntry, existingData);
    
    // Add or update period
    const existingIndex = existingData.periods.findIndex(p => p.period === period);
    if (existingIndex >= 0) {
      existingData.periods[existingIndex] = periodEntry;
    } else {
      existingData.periods.push(periodEntry);
    }
    
    existingData.lastUpdated = new Date().toISOString();
    
    // Save updated data
    await writeCSATMetrics(existingData);
    
    // Clean up uploaded file
    await fs.remove(filePath);
    
    res.json({ 
      success: true, 
      period: periodEntry,
      alerts: periodEntry.alerts.length
    });
  } catch (error) {
    console.error('Error uploading CSAT data:', error);
    if (req.file) {
      await fs.remove(req.file.path).catch(() => {});
    }
    res.status(500).json({ error: error.message });
  }
});

// POST /api/csat/metrics/manual - Manually enter CSAT/NPS data
router.post('/metrics/manual', async (req, res) => {
  try {
    const {
      period,
      periodType,
      organization,
      dimension,
      product,
      score,
      responses,
      surveyQuestion,
      npsScore,
      npsPromoters,
      npsPassives,
      npsDetractors
    } = req.body;
    
    if (!period || !score) {
      return res.status(400).json({ error: 'period and score are required' });
    }
    
    const existingData = await readCSATMetrics();
    
    // Find or create period entry
    let periodEntry = existingData.periods.find(p => p.period === period);
    
    if (!periodEntry) {
      const { startDate, endDate } = calculatePeriodDates(period, periodType);
      
      periodEntry = {
        id: uuidv4(),
        period,
        periodType: periodType || 'quarterly',
        startDate,
        endDate,
        collectedAt: new Date().toISOString(),
        dataSource: 'manual_entry',
        bankWide: { csat: {}, nps: {} },
        byOrganization: {},
        byProduct: {},
        byDimension: {},
        verbatims: [],
        alerts: []
      };
      
      existingData.periods.push(periodEntry);
    }
    
    // Add the manual entry to appropriate location
    if (organization && dimension) {
      // Organization-level dimension score
      if (!periodEntry.byOrganization[organization]) {
        periodEntry.byOrganization[organization] = {
          csat: {},
          dimensions: {}
        };
      }
      
      if (!periodEntry.byOrganization[organization].dimensions[dimension]) {
        periodEntry.byOrganization[organization].dimensions[dimension] = {};
      }
      
      periodEntry.byOrganization[organization].dimensions[dimension] = {
        score: parseFloat(score),
        responses: parseInt(responses) || 0,
        surveyQuestion: surveyQuestion || null
      };
    } else if (product) {
      // Product-level score
      if (!periodEntry.byProduct[product]) {
        periodEntry.byProduct[product] = {
          organization,
          csat: {},
          nps: {}
        };
      }
      
      periodEntry.byProduct[product].csat = {
        score: parseFloat(score),
        responses: parseInt(responses) || 0
      };
      
      if (npsScore !== undefined) {
        periodEntry.byProduct[product].nps = {
          score: parseInt(npsScore),
          responses: parseInt(responses) || 0,
          promoters: parseInt(npsPromoters) || 0,
          passives: parseInt(npsPassives) || 0,
          detractors: parseInt(npsDetractors) || 0
        };
      }
    }
    
    existingData.lastUpdated = new Date().toISOString();
    await writeCSATMetrics(existingData);
    
    res.json({ success: true, period: periodEntry });
  } catch (error) {
    console.error('Error adding manual entry:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/csat/metrics/alerts - Get alerts
router.get('/metrics/alerts', async (req, res) => {
  try {
    const { status, severity } = req.query;
    const data = await readCSATMetrics();
    
    let allAlerts = data.periods.flatMap(p => 
      (p.alerts || []).map(a => ({
        ...a,
        period: p.period
      }))
    );
    
    if (status) {
      allAlerts = allAlerts.filter(a => a.status === status);
    }
    
    if (severity) {
      allAlerts = allAlerts.filter(a => a.severity === severity);
    }
    
    // Sort by triggered date (most recent first)
    allAlerts.sort((a, b) => new Date(b.triggeredAt) - new Date(a.triggeredAt));
    
    res.json({ alerts: allAlerts });
  } catch (error) {
    console.error('Error getting alerts:', error);
    res.status(500).json({ error: 'Failed to get alerts' });
  }
});

// PUT /api/csat/metrics/alerts/:id - Update alert status
router.put('/metrics/alerts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['open', 'acknowledged', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const data = await readCSATMetrics();
    let found = false;
    
    for (const period of data.periods) {
      if (period.alerts) {
        const alert = period.alerts.find(a => a.id === id);
        if (alert) {
          alert.status = status;
          alert.updatedAt = new Date().toISOString();
          found = true;
          break;
        }
      }
    }
    
    if (!found) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    await writeCSATMetrics(data);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// GET /api/csat/metrics/export - Export scorecard data
router.get('/metrics/export', async (req, res) => {
  try {
    const { period, format = 'csv' } = req.query;
    
    if (!period) {
      return res.status(400).json({ error: 'period is required' });
    }
    
    const data = await readCSATMetrics();
    const periodData = data.periods.find(p => p.period === period);
    
    if (!periodData) {
      return res.status(404).json({ error: 'Period not found' });
    }
    
    if (format === 'csv') {
      const csv = generateScorecardCSV(periodData, data);
      
      // Record export
      if (!data.scorecardExports) {
        data.scorecardExports = [];
      }
      
      data.scorecardExports.push({
        id: uuidv4(),
        exportedAt: new Date().toISOString(),
        period,
        format: 'csv',
        includedMetrics: ['bankWide', 'byOrganization', 'byDimension']
      });
      
      await writeCSATMetrics(data);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=csat-scorecard-${period}.csv`);
      res.send(csv);
    } else {
      res.status(400).json({ error: 'Only CSV format is currently supported' });
    }
  } catch (error) {
    console.error('Error exporting scorecard:', error);
    res.status(500).json({ error: 'Failed to export scorecard' });
  }
});

// GET /api/csat/metrics/verbatims - Get customer verbatim comments
router.get('/metrics/verbatims', async (req, res) => {
  try {
    const { period, needsAnalysis, product, organization, limit = 100 } = req.query;
    const data = await readCSATMetrics();
    
    let verbatims = [];
    
    if (period) {
      const periodData = data.periods.find(p => p.period === period);
      verbatims = periodData?.verbatims || [];
    } else {
      verbatims = data.periods.flatMap(p => 
        (p.verbatims || []).map(v => ({
          ...v,
          period: p.period
        }))
      );
    }
    
    // Apply filters
    if (needsAnalysis === 'true') {
      verbatims = verbatims.filter(v => v.needsAnalysis);
    }
    
    if (product) {
      verbatims = verbatims.filter(v => v.product === product);
    }
    
    if (organization) {
      verbatims = verbatims.filter(v => v.organization === organization);
    }
    
    // Limit results
    verbatims = verbatims.slice(-parseInt(limit));
    
    res.json({ verbatims, total: verbatims.length });
  } catch (error) {
    console.error('Error getting verbatims:', error);
    res.status(500).json({ error: 'Failed to get verbatims' });
  }
});

// POST /api/csat/metrics/verbatims/:id/link - Link verbatim to insight
router.post('/metrics/verbatims/:id/link', async (req, res) => {
  try {
    const { id } = req.params;
    const { insightId, projectSlug } = req.body;
    
    const data = await readCSATMetrics();
    let found = false;
    
    for (const period of data.periods) {
      if (period.verbatims) {
        const verbatim = period.verbatims.find(v => v.id === id);
        if (verbatim) {
          verbatim.linkedInsight = insightId;
          verbatim.linkedProject = projectSlug;
          verbatim.needsAnalysis = false;
          verbatim.linkedAt = new Date().toISOString();
          found = true;
          break;
        }
      }
    }
    
    if (!found) {
      return res.status(404).json({ error: 'Verbatim not found' });
    }
    
    await writeCSATMetrics(data);
    res.json({ success: true });
  } catch (error) {
    console.error('Error linking verbatim:', error);
    res.status(500).json({ error: 'Failed to link verbatim' });
  }
});

// Helper functions for bank metrics

function calculatePeriodDates(period, periodType) {
  // Parse period string like "2026-Q1" or "2026-01"
  const isQuarterly = period.includes('Q');
  
  if (isQuarterly) {
    const [year, quarter] = period.split('-Q');
    const q = parseInt(quarter);
    const startMonth = (q - 1) * 3;
    const endMonth = startMonth + 2;
    
    return {
      startDate: `${year}-${String(startMonth + 1).padStart(2, '0')}-01`,
      endDate: `${year}-${String(endMonth + 1).padStart(2, '0')}-${getLastDayOfMonth(year, endMonth)}`
    };
  } else {
    // Monthly
    const [year, month] = period.split('-');
    return {
      startDate: `${year}-${month}-01`,
      endDate: `${year}-${month}-${getLastDayOfMonth(year, parseInt(month) - 1)}`
    };
  }
}

function getLastDayOfMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function aggregateCSATData(parsedData, existingData) {
  // Aggregate data by organization, product, dimension
  const bankWide = { csat: {}, nps: {} };
  const byOrganization = {};
  const byProduct = {};
  const byDimension = {};
  const verbatims = [];
  
  // Group by organization
  parsedData.forEach(row => {
    const org = row.organization || 'Unknown';
    const dimension = row.dimension || 'bank-csat';
    const product = row.product;
    const score = parseFloat(row.score);
    const responses = parseInt(row.responses) || 1;
    const verbatim = row.verbatim;
    
    if (isNaN(score)) return;
    
    // By organization
    if (!byOrganization[org]) {
      byOrganization[org] = {
        csat: { scores: [], totalResponses: 0 },
        nps: {},
        dimensions: {}
      };
    }
    
    byOrganization[org].csat.scores.push(score);
    byOrganization[org].csat.totalResponses += responses;
    
    // By dimension
    if (!byOrganization[org].dimensions[dimension]) {
      byOrganization[org].dimensions[dimension] = {
        scores: [],
        responses: 0,
        surveyQuestion: row.survey_question || null
      };
    }
    
    byOrganization[org].dimensions[dimension].scores.push(score);
    byOrganization[org].dimensions[dimension].responses += responses;
    
    // By product
    if (product) {
      if (!byProduct[product]) {
        byProduct[product] = {
          organization: org,
          csat: { scores: [], responses: 0 },
          nps: {}
        };
      }
      
      byProduct[product].csat.scores.push(score);
      byProduct[product].csat.responses += responses;
    }
    
    // Collect verbatims
    if (verbatim && verbatim.trim()) {
      verbatims.push({
        id: uuidv4(),
        text: verbatim,
        product,
        organization: org,
        dimension,
        csatScore: score,
        needsAnalysis: true,
        createdAt: new Date().toISOString()
      });
    }
  });
  
  // Calculate averages
  Object.keys(byOrganization).forEach(org => {
    const orgData = byOrganization[org];
    orgData.csat.score = parseFloat(
      (orgData.csat.scores.reduce((a, b) => a + b, 0) / orgData.csat.scores.length).toFixed(2)
    );
    orgData.csat.responses = orgData.csat.totalResponses;
    delete orgData.csat.scores;
    delete orgData.csat.totalResponses;
    
    // Calculate dimension averages
    Object.keys(orgData.dimensions).forEach(dim => {
      const dimData = orgData.dimensions[dim];
      dimData.score = parseFloat(
        (dimData.scores.reduce((a, b) => a + b, 0) / dimData.scores.length).toFixed(2)
      );
      delete dimData.scores;
    });
  });
  
  Object.keys(byProduct).forEach(prod => {
    const prodData = byProduct[prod];
    prodData.csat.score = parseFloat(
      (prodData.csat.scores.reduce((a, b) => a + b, 0) / prodData.csat.scores.length).toFixed(2)
    );
    delete prodData.csat.scores;
  });
  
  // Calculate bank-wide (average of all organizations)
  const allScores = Object.values(byOrganization).flatMap(o => 
    Object.values(o.dimensions).map(d => d.score)
  );
  
  if (allScores.length > 0) {
    bankWide.csat.score = parseFloat(
      (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(2)
    );
    bankWide.csat.responses = Object.values(byOrganization).reduce(
      (sum, o) => sum + o.csat.responses, 0
    );
  }
  
  return {
    bankWide,
    byOrganization,
    byProduct,
    byDimension,
    verbatims
  };
}

function calculateChanges(currentPeriod, allPeriods) {
  // Calculate QoQ (Quarter-over-Quarter) and YoY (Year-over-Year) changes
  const sortedPeriods = allPeriods
    .filter(p => p.period !== currentPeriod.period)
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  
  if (sortedPeriods.length === 0) return;
  
  // QoQ: Compare with previous period
  const previousPeriod = sortedPeriods[0];
  if (previousPeriod && currentPeriod.bankWide?.csat?.score) {
    const prevScore = previousPeriod.bankWide?.csat?.score;
    if (prevScore) {
      currentPeriod.bankWide.csat.qoqChange = parseFloat(
        (currentPeriod.bankWide.csat.score - prevScore).toFixed(2)
      );
    }
  }
  
  // YoY: Find period from one year ago
  const currentYear = parseInt(currentPeriod.period.split('-')[0]);
  const currentQuarter = currentPeriod.period.split('-Q')[1];
  const lastYearPeriod = `${currentYear - 1}-Q${currentQuarter}`;
  
  const yoyPeriod = allPeriods.find(p => p.period === lastYearPeriod);
  if (yoyPeriod && currentPeriod.bankWide?.csat?.score) {
    const yoyScore = yoyPeriod.bankWide?.csat?.score;
    if (yoyScore) {
      currentPeriod.bankWide.csat.yoyChange = parseFloat(
        (currentPeriod.bankWide.csat.score - yoyScore).toFixed(2)
      );
    }
  }
  
  // Calculate changes for organizations
  Object.keys(currentPeriod.byOrganization || {}).forEach(org => {
    const currentOrgScore = currentPeriod.byOrganization[org].csat.score;
    
    // QoQ
    const prevOrgScore = previousPeriod?.byOrganization?.[org]?.csat?.score;
    if (prevOrgScore) {
      currentPeriod.byOrganization[org].csat.qoqChange = parseFloat(
        (currentOrgScore - prevOrgScore).toFixed(2)
      );
    }
    
    // YoY
    const yoyOrgScore = yoyPeriod?.byOrganization?.[org]?.csat?.score;
    if (yoyOrgScore) {
      currentPeriod.byOrganization[org].csat.yoyChange = parseFloat(
        (currentOrgScore - yoyOrgScore).toFixed(2)
      );
    }
  });
}

function generateMetricAlerts(periodData, existingData) {
  const alerts = [];
  const thresholds = existingData.alertThresholds;
  
  // Check bank-wide CSAT
  if (periodData.bankWide?.csat?.score) {
    const bankScore = periodData.bankWide.csat.score;
    
    if (bankScore < thresholds.csatMinimum) {
      alerts.push({
        id: uuidv4(),
        type: 'threshold_breach',
        severity: 'critical',
        entity: 'Bank-wide',
        entityType: 'bank',
        metric: 'csat',
        currentValue: bankScore,
        threshold: thresholds.csatMinimum,
        triggeredAt: new Date().toISOString(),
        status: 'open'
      });
    }
    
    // Check QoQ drop
    const qoqDrop = periodData.bankWide.csat.qoqChange;
    if (qoqDrop && qoqDrop < thresholds.qoqDropThreshold) {
      alerts.push({
        id: uuidv4(),
        type: 'qoq_drop',
        severity: 'high',
        entity: 'Bank-wide',
        entityType: 'bank',
        metric: 'csat',
        currentValue: bankScore,
        change: qoqDrop,
        triggeredAt: new Date().toISOString(),
        status: 'open'
      });
    }
  }
  
  // Check organization-level alerts
  Object.entries(periodData.byOrganization || {}).forEach(([org, data]) => {
    if (data.csat?.score < thresholds.csatMinimum) {
      alerts.push({
        id: uuidv4(),
        type: 'threshold_breach',
        severity: 'high',
        entity: org,
        entityType: 'organization',
        metric: 'csat',
        currentValue: data.csat.score,
        threshold: thresholds.csatMinimum,
        triggeredAt: new Date().toISOString(),
        status: 'open'
      });
    }
  });
  
  return alerts;
}

function generateScorecardCSV(periodData, metaData) {
  const rows = [
    ['Metric', 'Entity', 'Level', 'Score', 'Responses', 'QoQ Change', 'YoY Change', 'Period']
  ];
  
  // Bank-wide
  if (periodData.bankWide?.csat) {
    rows.push([
      'Bank CSAT',
      'Bank-wide',
      'Bank',
      periodData.bankWide.csat.score || '',
      periodData.bankWide.csat.responses || '',
      periodData.bankWide.csat.qoqChange || '',
      periodData.bankWide.csat.yoyChange || '',
      periodData.period
    ]);
  }
  
  // By organization
  Object.entries(periodData.byOrganization || {}).forEach(([org, data]) => {
    rows.push([
      'Bank CSAT',
      org,
      'Organization',
      data.csat?.score || '',
      data.csat?.responses || '',
      data.csat?.qoqChange || '',
      data.csat?.yoyChange || '',
      periodData.period
    ]);
    
    // Dimensions for this org
    Object.entries(data.dimensions || {}).forEach(([dim, dimData]) => {
      const dimDef = metaData.dimensions?.find(d => d.id === dim);
      rows.push([
        dimDef?.name || dim,
        org,
        'Dimension',
        dimData.score || '',
        dimData.responses || '',
        '',
        '',
        periodData.period
      ]);
    });
  });
  
  // By product
  Object.entries(periodData.byProduct || {}).forEach(([product, data]) => {
    rows.push([
      'Product CSAT',
      product,
      'Product',
      data.csat?.score || '',
      data.csat?.responses || '',
      '',
      '',
      periodData.period
    ]);
  });
  
  return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

export default router;

