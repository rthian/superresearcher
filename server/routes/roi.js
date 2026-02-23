import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import { getSharedDir, listProjects, readActions, readProjectConfig, getProjectDir } from '../../src/utils/files.js';

const router = express.Router();

const ROI_PATH = () => path.join(getSharedDir(), 'roi-tracking.json');
const CSAT_PATH = () => path.join(getSharedDir(), 'csat-metrics.json');

async function readRoi() {
  const p = ROI_PATH();
  if (await fs.pathExists(p)) return fs.readJson(p);
  return { lastUpdated: null, trackedActions: [] };
}

async function readCsat() {
  const p = CSAT_PATH();
  if (await fs.pathExists(p)) return fs.readJson(p);
  return null;
}

function getMetricForPeriod(csatData, period, organization) {
  const periodData = csatData?.periods?.find((p) => p.period === period);
  if (!periodData) return null;
  if (organization) {
    const orgData = periodData.byOrganization?.[organization];
    return orgData ? { csat: orgData.csat?.score ?? null, nps: orgData.nps?.score ?? null } : null;
  }
  return { csat: periodData.bankWide?.csat?.score ?? null, nps: periodData.bankWide?.nps?.score ?? null };
}

function previousPeriod(period) {
  const match = period.match(/^(\d{4})-Q(\d)$/);
  if (!match) return null;
  let [, year, q] = match;
  year = parseInt(year); q = parseInt(q);
  if (q === 1) return `${year - 1}-Q4`;
  return `${year}-Q${q - 1}`;
}

// GET /api/roi - Get all tracked actions
router.get('/', async (req, res) => {
  try {
    const roi = await readRoi();
    res.json(roi);
  } catch (error) {
    console.error('Error reading ROI data:', error);
    res.status(500).json({ error: 'Failed to read ROI data' });
  }
});

// POST /api/roi/track - Track an action
router.post('/track', async (req, res) => {
  try {
    const { actionId, project, period, organization } = req.body;
    if (!actionId || !project || !period) {
      return res.status(400).json({ error: 'actionId, project, and period are required' });
    }

    const actionsData = await readActions(project);
    const action = actionsData?.actions?.find((a) => a.id === actionId);
    if (!action) {
      return res.status(404).json({ error: `Action ${actionId} not found in ${project}` });
    }

    const csatData = await readCsat();
    const prevPeriod = previousPeriod(period);
    const beforeMetrics = prevPeriod ? getMetricForPeriod(csatData, prevPeriod, organization) : null;
    const afterMetrics = getMetricForPeriod(csatData, period, organization);

    const roi = await readRoi();
    const existing = roi.trackedActions.findIndex((t) => t.actionId === actionId && t.project === project);

    const entry = {
      actionId,
      project,
      actionTitle: action.title,
      priority: action.priority,
      department: action.department,
      sourceInsight: action.sourceInsight,
      organization: organization || null,
      implementedPeriod: period,
      previousPeriod: prevPeriod,
      metrics: {
        csat: {
          before: beforeMetrics?.csat ?? null,
          after: afterMetrics?.csat ?? null,
          delta: beforeMetrics?.csat != null && afterMetrics?.csat != null
            ? parseFloat((afterMetrics.csat - beforeMetrics.csat).toFixed(2))
            : null,
        },
        nps: {
          before: beforeMetrics?.nps ?? null,
          after: afterMetrics?.nps ?? null,
          delta: beforeMetrics?.nps != null && afterMetrics?.nps != null
            ? afterMetrics.nps - beforeMetrics.nps
            : null,
        },
      },
      successMetrics: action.successMetrics || null,
      trackedAt: new Date().toISOString(),
      notes: '',
    };

    if (existing >= 0) {
      roi.trackedActions[existing] = entry;
    } else {
      roi.trackedActions.push(entry);
    }

    roi.lastUpdated = new Date().toISOString();
    await fs.writeJson(ROI_PATH(), roi, { spaces: 2 });

    res.json({ success: true, entry });
  } catch (error) {
    console.error('Error tracking ROI:', error);
    res.status(500).json({ error: 'Failed to track ROI' });
  }
});

// DELETE /api/roi/:actionId - Remove tracking
router.delete('/:actionId', async (req, res) => {
  try {
    const { actionId } = req.params;
    const { project } = req.query;
    const roi = await readRoi();
    roi.trackedActions = roi.trackedActions.filter(
      (t) => !(t.actionId === actionId && (!project || t.project === project))
    );
    roi.lastUpdated = new Date().toISOString();
    await fs.writeJson(ROI_PATH(), roi, { spaces: 2 });
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing ROI tracking:', error);
    res.status(500).json({ error: 'Failed to remove tracking' });
  }
});

// GET /api/roi/summary - Aggregate impact summary
router.get('/summary', async (req, res) => {
  try {
    const roi = await readRoi();
    const withCsat = roi.trackedActions.filter((t) => t.metrics.csat.delta != null);
    const withNps = roi.trackedActions.filter((t) => t.metrics.nps.delta != null);

    res.json({
      totalTracked: roi.trackedActions.length,
      csatMeasured: withCsat.length,
      npsMeasured: withNps.length,
      avgCsatDelta: withCsat.length > 0
        ? parseFloat((withCsat.reduce((s, t) => s + t.metrics.csat.delta, 0) / withCsat.length).toFixed(2))
        : null,
      avgNpsDelta: withNps.length > 0
        ? Math.round(withNps.reduce((s, t) => s + t.metrics.nps.delta, 0) / withNps.length)
        : null,
      trackedActions: roi.trackedActions,
    });
  } catch (error) {
    console.error('Error getting ROI summary:', error);
    res.status(500).json({ error: 'Failed to get ROI summary' });
  }
});

export default router;
