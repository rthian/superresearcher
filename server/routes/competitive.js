import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import { getSharedDir } from '../../src/utils/files.js';

const router = express.Router();
const COMP_DIR = () => path.join(getSharedDir(), 'competitive');

async function readFile(filename) {
  const p = path.join(COMP_DIR(), filename);
  if (await fs.pathExists(p)) return fs.readJson(p);
  return null;
}

// GET /api/competitive/competitors
router.get('/competitors', async (req, res) => {
  try {
    const data = await readFile('competitors.json');
    res.json(data || { competitors: [], featureCategories: [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read competitors' });
  }
});

// GET /api/competitive/features
router.get('/features', async (req, res) => {
  try {
    const data = await readFile('features.json');
    res.json(data || { features: [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read features' });
  }
});

// GET /api/competitive/pricing
router.get('/pricing', async (req, res) => {
  try {
    const data = await readFile('pricing.json');
    res.json(data || { entries: [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read pricing' });
  }
});

// GET /api/competitive/perception
router.get('/perception', async (req, res) => {
  try {
    const data = await readFile('perception.json');
    res.json(data || { entries: [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read perception' });
  }
});

// GET /api/competitive/releases
router.get('/releases', async (req, res) => {
  try {
    const data = await readFile('release-log.json');
    res.json(data || { releases: [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read releases' });
  }
});

// GET /api/competitive/summary - Aggregate view
router.get('/summary', async (req, res) => {
  try {
    const [competitors, features, pricing, perception, releases] = await Promise.all([
      readFile('competitors.json'),
      readFile('features.json'),
      readFile('pricing.json'),
      readFile('perception.json'),
      readFile('release-log.json'),
    ]);

    res.json({
      competitorCount: competitors?.competitors?.length || 0,
      featureCount: features?.features?.length || 0,
      pricingEntries: pricing?.entries?.length || 0,
      perceptionEntries: perception?.entries?.length || 0,
      releaseCount: releases?.releases?.length || 0,
      competitors: competitors?.competitors || [],
      featureCategories: competitors?.featureCategories || [],
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read competitive summary' });
  }
});

export default router;
