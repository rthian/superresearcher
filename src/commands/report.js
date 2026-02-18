import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import {
  listProjects,
  readInsights,
  readActions,
  readProjectConfig,
  getProjectsDir,
  getSharedDir,
} from '../utils/files.js';

/**
 * Generate a report
 * Usage: superresearcher report <type> [period]
 * Types: strategic-brief | insight-backlog
 */
export async function reportCommand(reportType, period) {
  const spinner = ora(`Generating ${reportType} report...`).start();

  try {
    const now = new Date();
    const periodVal = period || `${now.getFullYear()}-Q${Math.ceil((now.getMonth() + 1) / 3)}`;
    const dateStr = now.toISOString().split('T')[0];

    if (reportType === 'strategic-brief') {
      await generateStrategicBrief(periodVal, dateStr, spinner);
    } else if (reportType === 'insight-backlog') {
      await generateInsightBacklog(periodVal, dateStr, spinner);
    } else if (reportType === 'roi') {
      // Delegate to roi command
      const { roiReportCommand } = await import('./roi.js');
      spinner.stop();
      await roiReportCommand(periodVal);
    } else {
      spinner.fail(`Unknown report type: ${reportType}`);
      console.log(chalk.yellow('\nValid types: strategic-brief, insight-backlog, roi'));
      process.exit(1);
    }
  } catch (error) {
    spinner.fail('Report generation failed');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

async function generateStrategicBrief(period, dateStr, spinner) {
  const projects = await listProjects();
  const allInsights = [];
  const allActions = [];
  let csatData = null;

  for (const proj of projects) {
    const [insights, actions] = await Promise.all([
      readInsights(proj),
      readActions(proj),
    ]);
    const insightsList = insights.insights || [];
    const actionsList = actions.actions || [];
    allInsights.push(...insightsList.map((i) => ({ ...i, project: proj })));
    allActions.push(...actionsList.map((a) => ({ ...a, project: proj })));
  }

  // Load CSAT metrics if available
  const csatPath = path.join(getSharedDir(), 'csat-metrics.json');
  if (await fs.pathExists(csatPath)) {
    csatData = await fs.readJson(csatPath);
  }

  // Load competitive data
  const compDir = path.join(getSharedDir(), 'competitive');
  let featuresData = null;
  let pricingData = null;
  let releasesData = null;
  if (await fs.pathExists(compDir)) {
    const featuresPath = path.join(compDir, 'features.json');
    const pricingPath = path.join(compDir, 'pricing.json');
    const releasesPath = path.join(compDir, 'release-log.json');
    if (await fs.pathExists(featuresPath)) featuresData = await fs.readJson(featuresPath);
    if (await fs.pathExists(pricingPath)) pricingData = await fs.readJson(pricingPath);
    if (await fs.pathExists(releasesPath)) releasesData = await fs.readJson(releasesPath);
  }

  // Get top 5 insights by impact (High > Medium > Low)
  const impactOrder = { High: 0, Medium: 1, Low: 2 };
  const topInsights = allInsights
    .sort((a, b) => (impactOrder[a.impactLevel] ?? 2) - (impactOrder[b.impactLevel] ?? 2))
    .slice(0, 5);

  // Get top 3 actions by priority (Critical > High > Medium > Low)
  const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  const topActions = allActions
    .filter((a) => a.priority)
    .sort((a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2))
    .slice(0, 3);

  const periodData = csatData?.periods?.find((p) => p.period === period);

  const replacements = {
    PERIOD: period,
    DATE: dateStr,
    EXECUTIVE_SUMMARY: `[Summarize top 3–5 insights and recommended focus for ${period} in 2–3 sentences.]`,
    INSIGHT_1_TITLE: topInsights[0]?.title || '[Fill in]',
    INSIGHT_1_IMPACT: topInsights[0]?.impactLevel || '[Fill in]',
    INSIGHT_1_SOURCE: topInsights[0]?.project || '[Fill in]',
    INSIGHT_2_TITLE: topInsights[1]?.title || '[Fill in]',
    INSIGHT_2_IMPACT: topInsights[1]?.impactLevel || '[Fill in]',
    INSIGHT_2_SOURCE: topInsights[1]?.project || '[Fill in]',
    INSIGHT_3_TITLE: topInsights[2]?.title || '[Fill in]',
    INSIGHT_3_IMPACT: topInsights[2]?.impactLevel || '[Fill in]',
    INSIGHT_3_SOURCE: topInsights[2]?.project || '[Fill in]',
    INSIGHT_4_TITLE: topInsights[3]?.title || '[Fill in]',
    INSIGHT_4_IMPACT: topInsights[3]?.impactLevel || '[Fill in]',
    INSIGHT_4_SOURCE: topInsights[3]?.project || '[Fill in]',
    INSIGHT_5_TITLE: topInsights[4]?.title || '[Fill in]',
    INSIGHT_5_IMPACT: topInsights[4]?.impactLevel || '[Fill in]',
    INSIGHT_5_SOURCE: topInsights[4]?.project || '[Fill in]',
    CSAT_SCORE: periodData?.bankWide?.csat?.score ?? '[Fill in]',
    CSAT_QOQ: periodData?.bankWide?.csat?.qoqChange ?? '[Fill in]',
    CSAT_TREND: periodData?.bankWide?.csat?.qoqChange != null
      ? (periodData.bankWide.csat.qoqChange > 0 ? '↑' : periodData.bankWide.csat.qoqChange < 0 ? '↓' : '—')
      : '[Fill in]',
    NPS_SCORE: periodData?.bankWide?.nps?.score ?? '[Fill in]',
    NPS_QOQ: periodData?.bankWide?.nps?.trend ?? '[Fill in]',
    NPS_TREND: periodData?.bankWide?.nps?.score != null ? '—' : '[Fill in]',
    FEATURE_GAPS: buildFeatureGaps(featuresData),
    COMPETITOR_RELEASES: buildCompetitorReleases(releasesData),
    PRICING_CHANGES: buildPricingChanges(pricingData),
    ACTION_1_TITLE: topActions[0]?.title || '[Fill in]',
    ACTION_1_PRIORITY: topActions[0]?.priority || '[Fill in]',
    ACTION_1_DEPARTMENT: topActions[0]?.department || '[Fill in]',
    ACTION_2_TITLE: topActions[1]?.title || '[Fill in]',
    ACTION_2_PRIORITY: topActions[1]?.priority || '[Fill in]',
    ACTION_2_DEPARTMENT: topActions[1]?.department || '[Fill in]',
    ACTION_3_TITLE: topActions[2]?.title || '[Fill in]',
    ACTION_3_PRIORITY: topActions[2]?.priority || '[Fill in]',
    ACTION_3_DEPARTMENT: topActions[2]?.department || '[Fill in]',
    ASK: '[One-line: what do you need from leadership?]',
  };

  const templatePath = path.join(process.cwd(), 'templates', 'reports', 'strategic-brief.md');
  let template = await fs.readFile(templatePath, 'utf-8');
  for (const [key, value] of Object.entries(replacements)) {
    template = template.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  }

  const outputDir = path.join(process.cwd(), 'shared', 'reports');
  await fs.ensureDir(outputDir);
  const outputPath = path.join(outputDir, `strategic-brief-${period}.md`);
  await fs.writeFile(outputPath, template);

  spinner.succeed('Strategic brief generated');
  console.log(chalk.yellow(`\nOutput: ${outputPath}`));
  console.log(chalk.dim('Review and fill in placeholders marked [Fill in], then export to PDF/PPT.\n'));
}

async function generateInsightBacklog(period, dateStr, spinner) {
  const projects = await listProjects();
  const allInsights = [];
  const allActions = [];

  for (const proj of projects) {
    const [insights, actions] = await Promise.all([
      readInsights(proj),
      readActions(proj),
    ]);
    const insightsList = insights.insights || [];
    const actionsList = actions.actions || [];
    allInsights.push(...insightsList.map((i) => ({ ...i, project: proj })));
    allActions.push(...actionsList.map((a) => ({ ...a, project: proj })));
  }

  const highImpactCount = allInsights.filter((i) => i.impactLevel === 'High').length;
  const actionIds = new Set(allActions.map((a) => a.sourceInsight).filter(Boolean));
  const linkedCount = allInsights.filter((i) => actionIds.has(i.id)).length;

  // Group by product area
  const byProductArea = {};
  for (const i of allInsights) {
    const area = i.productArea || 'Uncategorized';
    if (!byProductArea[area]) byProductArea[area] = [];
    byProductArea[area].push(i);
  }

  let insightsByProductArea = '';
  for (const [area, items] of Object.entries(byProductArea).sort((a, b) => b[1].length - a[1].length)) {
    insightsByProductArea += `### ${area}\n`;
    for (const i of items.slice(0, 5)) {
      insightsByProductArea += `- **${i.title}** (${i.impactLevel}) — ${i.project}\n`;
    }
    if (items.length > 5) insightsByProductArea += `- _…and ${items.length - 5} more_\n`;
    insightsByProductArea += `\n`;
  }

  // Group by project
  const byProject = {};
  for (const i of allInsights) {
    const proj = i.project || 'Unknown';
    if (!byProject[proj]) byProject[proj] = [];
    byProject[proj].push(i);
  }

  let insightsByProject = '';
  for (const [proj, items] of Object.entries(byProject)) {
    insightsByProject += `### ${proj}\n`;
    for (const i of items.slice(0, 5)) {
      insightsByProject += `- ${i.title} (${i.impactLevel})\n`;
    }
    if (items.length > 5) insightsByProject += `- _…and ${items.length - 5} more_\n`;
    insightsByProject += `\n`;
  }

  // Action status summary
  const statusCounts = {};
  for (const a of allActions) {
    const s = a.status || 'Not Started';
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  }
  let actionStatusSummary = '';
  for (const [status, count] of Object.entries(statusCounts)) {
    actionStatusSummary += `- **${status}:** ${count}\n`;
  }

  // New insights (last 5)
  const newInsights = allInsights.slice(0, 10).map((i) => `- **${i.title}** — ${i.project} (${i.impactLevel})`).join('\n');

  const output = `# Product Insight Backlog

**Period:** ${period}
**Audience:** Product Leadership
**Generated:** ${dateStr}

---

## Overview

| Metric | Count |
|--------|-------|
| Total insights | ${allInsights.length} |
| High impact | ${highImpactCount} |
| Linked actions | ${linkedCount} |
| Projects | ${projects.length} |

---

## Insights by Product Area

${insightsByProductArea || '_No product areas tagged_'}

---

## Insights by Project

${insightsByProject || '_No insights_'}

---

## Action Status Summary

${actionStatusSummary || '_No actions_'}

---

## Recent Insights (Top 10)

${newInsights || '_No insights_'}

`;

  const outputDir = path.join(process.cwd(), 'shared', 'reports');
  await fs.ensureDir(outputDir);
  const outputPath = path.join(outputDir, `insight-backlog-${period}.md`);
  await fs.writeFile(outputPath, output);

  spinner.succeed('Insight backlog generated');
  console.log(chalk.yellow(`\nOutput: ${outputPath}`));
  console.log(chalk.dim('Share with product leadership for monthly review.\n'));
}

// ─── Competitive data helpers for strategic brief ──────────────────────────

function buildFeatureGaps(featuresData) {
  if (!featuresData?.features?.length) return '_No feature data available. Run `superresearcher competitive add-feature` to populate._';

  const gaps = featuresData.features.filter((f) => {
    const gxs = f.competitors?.gxs?.status;
    const gxb = f.competitors?.gxb?.status;
    const othersHave = Object.entries(f.competitors || {}).some(
      ([id, v]) => id !== 'gxs' && id !== 'gxb' && v.status === 'available'
    );
    return (gxs === 'not-available' || gxb === 'not-available') && othersHave;
  });

  if (gaps.length === 0) return '_No feature gaps detected._';

  let md = '';
  for (const g of gaps) {
    const availableAt = Object.entries(g.competitors || {})
      .filter(([id, v]) => id !== 'gxs' && id !== 'gxb' && v.status === 'available')
      .map(([id]) => id)
      .join(', ');
    md += `- **${g.name}** (${g.category}) — Available at: ${availableAt}\n`;
  }
  return md;
}

function buildCompetitorReleases(releasesData) {
  if (!releasesData?.releases?.length) return '_No releases logged. Run `superresearcher competitive add-release` to populate._';

  const recent = releasesData.releases.slice(-5).reverse();
  let md = '';
  for (const r of recent) {
    md += `- **${r.competitor}** — ${r.feature} (${r.category}, ${r.date}) [${r.impact}]\n`;
  }
  return md;
}

function buildPricingChanges(pricingData) {
  if (!pricingData?.entries?.length) return '_No pricing changes logged. Run `superresearcher competitive add-pricing` to populate._';

  const recent = pricingData.entries.slice(-5).reverse();
  let md = '';
  for (const p of recent) {
    md += `- **${p.competitor}** ${p.product}: ${p.previousValue || '—'} → ${p.newValue} (${p.effectiveDate})\n`;
  }
  return md;
}
