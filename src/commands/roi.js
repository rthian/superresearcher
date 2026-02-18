import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import {
  listProjects,
  readActions,
  readProjectConfig,
  getSharedDir,
} from '../utils/files.js';

const ROI_PATH = () => path.join(getSharedDir(), 'roi-tracking.json');
const CSAT_PATH = () => path.join(getSharedDir(), 'csat-metrics.json');

async function readRoi() {
  const p = ROI_PATH();
  if (await fs.pathExists(p)) return fs.readJson(p);
  return { lastUpdated: null, trackedActions: [] };
}

async function writeRoi(data) {
  data.lastUpdated = new Date().toISOString();
  await fs.writeJson(ROI_PATH(), data, { spaces: 2 });
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
    return orgData
      ? { csat: orgData.csat?.score ?? null, nps: orgData.nps?.score ?? null }
      : null;
  }

  return {
    csat: periodData.bankWide?.csat?.score ?? null,
    nps: periodData.bankWide?.nps?.score ?? null,
  };
}

function previousPeriod(period) {
  const match = period.match(/^(\d{4})-Q(\d)$/);
  if (!match) return null;
  let [, year, q] = match;
  year = parseInt(year);
  q = parseInt(q);
  if (q === 1) return `${year - 1}-Q4`;
  return `${year}-Q${q - 1}`;
}

// ─── superresearcher roi track ─────────────────────────────────────────────
export async function roiTrackCommand(options) {
  const { actionId, project, period, organization } = options;

  if (!actionId || !project || !period) {
    console.log(chalk.red('Required: --action-id, --project, --period'));
    console.log(chalk.yellow('  Example: superresearcher roi track --action-id action-001 --project appstore --period 2026-Q1 --organization GXS'));
    return;
  }

  const spinner = ora('Linking action to metrics...').start();

  // Read the action
  const actionsData = await readActions(project);
  const action = actionsData?.actions?.find((a) => a.id === actionId);
  if (!action) {
    spinner.fail(`Action ${actionId} not found in project ${project}`);
    return;
  }

  // Read CSAT data
  const csatData = await readCsat();
  const prevPeriod = previousPeriod(period);
  const beforeMetrics = prevPeriod ? getMetricForPeriod(csatData, prevPeriod, organization) : null;
  const afterMetrics = getMetricForPeriod(csatData, period, organization);

  // Read or create ROI tracking
  const roi = await readRoi();

  // Check if already tracked
  const existing = roi.trackedActions.findIndex(
    (t) => t.actionId === actionId && t.project === project
  );

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

  await writeRoi(roi);

  spinner.succeed(`Tracked: ${action.title}`);
  console.log(chalk.dim(`  Period: ${prevPeriod || '?'} → ${period}`));
  if (entry.metrics.csat.before != null) {
    const csatArrow = entry.metrics.csat.delta > 0 ? chalk.green('↑') : entry.metrics.csat.delta < 0 ? chalk.red('↓') : '—';
    console.log(`  CSAT: ${entry.metrics.csat.before} → ${entry.metrics.csat.after} (${csatArrow} ${entry.metrics.csat.delta})`);
  } else {
    console.log(chalk.dim('  CSAT: data not available for this period'));
  }
  if (entry.metrics.nps.before != null) {
    const npsArrow = entry.metrics.nps.delta > 0 ? chalk.green('↑') : entry.metrics.nps.delta < 0 ? chalk.red('↓') : '—';
    console.log(`  NPS:  ${entry.metrics.nps.before} → ${entry.metrics.nps.after} (${npsArrow} ${entry.metrics.nps.delta})`);
  } else {
    console.log(chalk.dim('  NPS: data not available for this period'));
  }
  console.log('');
}

// ─── superresearcher roi status ────────────────────────────────────────────
export async function roiStatusCommand() {
  const roi = await readRoi();

  if (!roi.trackedActions.length) {
    console.log(chalk.yellow('\nNo actions tracked yet.'));
    console.log(chalk.dim('Use: superresearcher roi track --action-id <id> --project <slug> --period <period>\n'));
    return;
  }

  console.log(chalk.cyan(`\nROI Tracking Status (${roi.trackedActions.length} actions)\n`));

  for (const t of roi.trackedActions) {
    const csatDelta = t.metrics.csat.delta;
    const npsDelta = t.metrics.nps.delta;
    const csatStr = csatDelta != null
      ? `CSAT ${csatDelta > 0 ? chalk.green(`+${csatDelta}`) : csatDelta < 0 ? chalk.red(csatDelta) : '0'}`
      : chalk.dim('CSAT N/A');
    const npsStr = npsDelta != null
      ? `NPS ${npsDelta > 0 ? chalk.green(`+${npsDelta}`) : npsDelta < 0 ? chalk.red(npsDelta) : '0'}`
      : chalk.dim('NPS N/A');

    console.log(`  ${chalk.white.bold(t.actionTitle)}`);
    console.log(`    ${chalk.dim(t.project)} | ${t.priority} | ${t.department} | ${t.implementedPeriod}`);
    console.log(`    ${csatStr} | ${npsStr}`);
    console.log('');
  }
}

// ─── superresearcher report roi ────────────────────────────────────────────
export async function roiReportCommand(period) {
  const spinner = ora('Generating ROI report...').start();

  const roi = await readRoi();
  const csatData = await readCsat();
  const periodVal = period || getCurrentQuarter();

  // Also collect all implemented actions across projects that aren't yet tracked
  const projects = await listProjects();
  const allActions = [];
  for (const proj of projects) {
    const [actions, config] = await Promise.all([readActions(proj), readProjectConfig(proj)]);
    for (const a of actions?.actions || []) {
      allActions.push({ ...a, project: proj, organization: config?.organization });
    }
  }

  const implementedNotTracked = allActions.filter(
    (a) =>
      (a.status === 'Complete' || a.status === 'Implemented') &&
      !roi.trackedActions.some((t) => t.actionId === a.id && t.project === a.project)
  );

  // Build report
  let md = `# ROI Report — Actions Impact on CSAT & NPS\n\n`;
  md += `**Period:** ${periodVal}\n`;
  md += `**Generated:** ${new Date().toISOString().split('T')[0]}\n`;
  md += `**Tracked Actions:** ${roi.trackedActions.length}\n\n`;
  md += `---\n\n`;

  // Summary table
  if (roi.trackedActions.length > 0) {
    md += `## Tracked Actions & Metric Impact\n\n`;
    md += `| Action | Project | Priority | Period | CSAT Before | CSAT After | CSAT Delta | NPS Before | NPS After | NPS Delta |\n`;
    md += `|--------|---------|----------|--------|-------------|------------|------------|------------|-----------|----------|\n`;

    for (const t of roi.trackedActions) {
      const csatBefore = t.metrics.csat.before ?? '—';
      const csatAfter = t.metrics.csat.after ?? '—';
      const csatDelta = t.metrics.csat.delta != null ? (t.metrics.csat.delta > 0 ? `+${t.metrics.csat.delta}` : t.metrics.csat.delta) : '—';
      const npsBefore = t.metrics.nps.before ?? '—';
      const npsAfter = t.metrics.nps.after ?? '—';
      const npsDelta = t.metrics.nps.delta != null ? (t.metrics.nps.delta > 0 ? `+${t.metrics.nps.delta}` : t.metrics.nps.delta) : '—';

      md += `| ${t.actionTitle} | ${t.project} | ${t.priority} | ${t.implementedPeriod} | ${csatBefore} | ${csatAfter} | ${csatDelta} | ${npsBefore} | ${npsAfter} | ${npsDelta} |\n`;
    }
    md += `\n`;

    // Aggregate impact
    const withCsat = roi.trackedActions.filter((t) => t.metrics.csat.delta != null);
    const withNps = roi.trackedActions.filter((t) => t.metrics.nps.delta != null);
    const avgCsatDelta = withCsat.length > 0 ? (withCsat.reduce((s, t) => s + t.metrics.csat.delta, 0) / withCsat.length).toFixed(2) : 'N/A';
    const avgNpsDelta = withNps.length > 0 ? Math.round(withNps.reduce((s, t) => s + t.metrics.nps.delta, 0) / withNps.length) : 'N/A';

    md += `### Aggregate Impact\n\n`;
    md += `| Metric | Avg Delta | Actions Measured |\n`;
    md += `|--------|-----------|------------------|\n`;
    md += `| CSAT | ${avgCsatDelta} | ${withCsat.length} |\n`;
    md += `| NPS | ${avgNpsDelta} | ${withNps.length} |\n\n`;
  } else {
    md += `## No Actions Tracked Yet\n\n`;
    md += `Use \`superresearcher roi track\` to link implemented actions to CSAT/NPS periods.\n\n`;
  }

  // CSAT/NPS trend context
  if (csatData?.periods?.length > 0) {
    md += `---\n\n## CSAT & NPS Trend (Context)\n\n`;
    md += `| Period | Bank CSAT | QoQ | Bank NPS | QoQ |\n`;
    md += `|--------|-----------|-----|----------|-----|\n`;
    for (const p of csatData.periods.slice(-6)) {
      const csat = p.bankWide?.csat?.score ?? '—';
      const csatQoq = p.bankWide?.csat?.qoqChange ?? '—';
      const nps = p.bankWide?.nps?.score ?? '—';
      const npsQoq = p.bankWide?.nps?.qoqChange ?? '—';
      md += `| ${p.period} | ${csat} | ${csatQoq} | ${nps} | ${npsQoq} |\n`;
    }
    md += `\n`;
  }

  // Untracked implemented actions
  if (implementedNotTracked.length > 0) {
    md += `---\n\n## Implemented but Not Tracked\n\n`;
    md += `These actions are marked Complete/Implemented but not yet linked to metric periods:\n\n`;
    for (const a of implementedNotTracked) {
      md += `- **${a.title}** (${a.project}) — ${a.priority}\n`;
    }
    md += `\n`;
  }

  // Success metrics reference
  if (roi.trackedActions.length > 0) {
    md += `---\n\n## Success Metrics (Defined at Action Creation)\n\n`;
    for (const t of roi.trackedActions) {
      if (t.successMetrics) {
        md += `### ${t.actionTitle}\n`;
        md += `${t.successMetrics}\n\n`;
      }
    }
  }

  // Write
  const outputDir = path.join(getSharedDir(), 'reports');
  await fs.ensureDir(outputDir);
  const outputPath = path.join(outputDir, `roi-report-${periodVal}.md`);
  await fs.writeFile(outputPath, md);

  spinner.succeed('ROI report generated');
  console.log(chalk.yellow(`\nOutput: ${outputPath}\n`));
}

function getCurrentQuarter() {
  const now = new Date();
  return `${now.getFullYear()}-Q${Math.ceil((now.getMonth() + 1) / 3)}`;
}
