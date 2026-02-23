import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { v4 as uuidv4 } from 'uuid';
import { getSharedDir } from '../utils/files.js';

const COMPETITIVE_DIR = () => path.join(getSharedDir(), 'competitive');

async function readJson(filename) {
  const filePath = path.join(COMPETITIVE_DIR(), filename);
  if (await fs.pathExists(filePath)) {
    return fs.readJson(filePath);
  }
  return null;
}

async function writeJson(filename, data) {
  data.lastUpdated = new Date().toISOString();
  const filePath = path.join(COMPETITIVE_DIR(), filename);
  await fs.writeJson(filePath, data, { spaces: 2 });
}

// ─── superresearcher competitive list ──────────────────────────────────────
export async function competitiveListCommand() {
  const data = await readJson('competitors.json');
  if (!data) {
    console.log(chalk.red('No competitors.json found. Run setup first.'));
    return;
  }

  console.log(chalk.cyan('\nTracked Competitors\n'));

  const byMarket = {};
  for (const c of data.competitors) {
    if (!byMarket[c.market]) byMarket[c.market] = [];
    byMarket[c.market].push(c);
  }

  for (const [market, competitors] of Object.entries(byMarket)) {
    console.log(chalk.white.bold(`  ${market === 'MY' ? 'Malaysia' : market === 'SG' ? 'Singapore' : market}`));
    for (const c of competitors) {
      const typeLabel = c.type === 'incumbent' ? chalk.dim('incumbent') : c.type === 'digital-bank' ? chalk.green('digital') : chalk.yellow('fintech');
      console.log(`    ${chalk.cyan(c.name.padEnd(25))} ${typeLabel.padEnd(20)} ${chalk.dim(c.segment)}`);
    }
    console.log('');
  }

  console.log(chalk.dim(`  Feature categories: ${data.featureCategories.map(c => c.id).join(', ')}`));
  console.log('');
}

// ─── superresearcher competitive add-feature ───────────────────────────────
export async function competitiveAddFeatureCommand(options) {
  const { name, category, competitor, status, notes } = options;

  if (!name || !category || !competitor || !status) {
    console.log(chalk.red('Required: --name, --category, --competitor, --status'));
    console.log(chalk.yellow('  Example: superresearcher competitive add-feature --name "Apple Pay" --category payments --competitor dbs --status available'));
    return;
  }

  const spinner = ora('Adding feature...').start();
  const data = await readJson('features.json');
  if (!data) { spinner.fail('features.json not found'); return; }

  // Find or create feature
  let feature = data.features.find(f => f.id === slugify(name));
  if (!feature) {
    feature = {
      id: slugify(name),
      name,
      category,
      competitors: {}
    };
    data.features.push(feature);
  }

  feature.competitors[competitor] = {
    status,
    notes: notes || '',
    asOf: getCurrentQuarter()
  };

  await writeJson('features.json', data);
  spinner.succeed(`Feature "${name}" updated for ${competitor}: ${status}`);
}

// ─── superresearcher competitive add-pricing ───────────────────────────────
export async function competitiveAddPricingCommand(options) {
  const { competitor, category, product, previous, current, source, notes } = options;

  if (!competitor || !product || !current) {
    console.log(chalk.red('Required: --competitor, --product, --current'));
    console.log(chalk.yellow('  Example: superresearcher competitive add-pricing --competitor gxb --product "GX Account" --previous "3% p.a." --current "2% p.a." --category savings'));
    return;
  }

  const spinner = ora('Adding pricing entry...').start();
  const data = await readJson('pricing.json');
  if (!data) { spinner.fail('pricing.json not found'); return; }

  const competitors = await readJson('competitors.json');
  const comp = competitors?.competitors?.find(c => c.id === competitor);

  data.entries.push({
    id: `pricing-${String(data.entries.length + 1).padStart(3, '0')}`,
    competitor,
    market: comp?.market || 'unknown',
    category: category || 'unknown',
    type: 'rate-change',
    product,
    previousValue: previous || null,
    newValue: current,
    effectiveDate: getCurrentQuarter(),
    recordedAt: new Date().toISOString(),
    source: source || 'manual',
    notes: notes || ''
  });

  await writeJson('pricing.json', data);
  spinner.succeed(`Pricing entry added: ${competitor} / ${product} → ${current}`);
}

// ─── superresearcher competitive add-release ───────────────────────────────
export async function competitiveAddReleaseCommand(options) {
  const { competitor, feature, category, date, source, impact, notes } = options;

  if (!competitor || !feature) {
    console.log(chalk.red('Required: --competitor, --feature'));
    console.log(chalk.yellow('  Example: superresearcher competitive add-release --competitor trust-bank --feature "Credit card launch" --category cards --impact Medium'));
    return;
  }

  const spinner = ora('Adding release...').start();
  const data = await readJson('release-log.json');
  if (!data) { spinner.fail('release-log.json not found'); return; }

  const competitors = await readJson('competitors.json');
  const comp = competitors?.competitors?.find(c => c.id === competitor);

  data.releases.push({
    id: `rel-${String(data.releases.length + 1).padStart(3, '0')}`,
    competitor,
    market: comp?.market || 'unknown',
    feature,
    category: category || 'unknown',
    date: date || new Date().toISOString().split('T')[0],
    source: source || 'manual',
    impact: impact || 'Medium',
    notes: notes || ''
  });

  await writeJson('release-log.json', data);
  spinner.succeed(`Release logged: ${competitor} → ${feature}`);
}

// ─── superresearcher competitive add-perception ────────────────────────────
export async function competitiveAddPerceptionCommand(options) {
  const { competitor, theme, sentiment, source, period, summary, verbatim } = options;

  if (!competitor || !theme || !sentiment) {
    console.log(chalk.red('Required: --competitor, --theme, --sentiment'));
    console.log(chalk.yellow('  Example: superresearcher competitive add-perception --competitor gxb --theme "Easy onboarding" --sentiment positive'));
    return;
  }

  const spinner = ora('Adding perception...').start();
  const data = await readJson('perception.json');
  if (!data) { spinner.fail('perception.json not found'); return; }

  const competitors = await readJson('competitors.json');
  const comp = competitors?.competitors?.find(c => c.id === competitor);

  data.entries.push({
    id: `perc-${String(data.entries.length + 1).padStart(3, '0')}`,
    competitor,
    market: comp?.market || 'unknown',
    theme,
    sentiment,
    source: source || 'manual',
    period: period || getCurrentQuarter(),
    summary: summary || '',
    verbatimCount: 0,
    sampleVerbatim: verbatim || ''
  });

  await writeJson('perception.json', data);
  spinner.succeed(`Perception added: ${competitor} → ${theme} (${sentiment})`);
}

// ─── superresearcher competitive summary ───────────────────────────────────
export async function competitiveSummaryCommand(period) {
  const spinner = ora('Generating competitive summary...').start();

  const [competitors, features, pricing, perception, releases] = await Promise.all([
    readJson('competitors.json'),
    readJson('features.json'),
    readJson('pricing.json'),
    readJson('perception.json'),
    readJson('release-log.json')
  ]);

  if (!competitors) {
    spinner.fail('No competitive data found');
    return;
  }

  const periodVal = period || getCurrentQuarter();

  // Build summary markdown
  let md = `# Competitive Intelligence Summary\n\n`;
  md += `**Period:** ${periodVal}\n`;
  md += `**Generated:** ${new Date().toISOString().split('T')[0]}\n\n`;
  md += `---\n\n`;

  // Competitors tracked
  md += `## Competitors Tracked\n\n`;
  md += `| Competitor | Type | Market | Segment |\n`;
  md += `|-----------|------|--------|--------|\n`;
  for (const c of competitors.competitors) {
    md += `| ${c.name} | ${c.type} | ${c.market} | ${c.segment} |\n`;
  }
  md += `\n`;

  // Feature matrix
  if (features?.features?.length > 0) {
    md += `## Feature Matrix\n\n`;
    const compIds = ['gxs', 'gxb', ...competitors.competitors.map(c => c.id)];
    const compNames = { gxs: 'GXS', gxb: 'GXB' };
    for (const c of competitors.competitors) compNames[c.id] = c.name;
    const uniqueIds = [...new Set(compIds)];

    md += `| Feature | Category | ${uniqueIds.map(id => compNames[id] || id).join(' | ')} |\n`;
    md += `|---------|----------|${uniqueIds.map(() => '---').join('|')}|\n`;
    for (const f of features.features) {
      const statuses = uniqueIds.map(id => {
        const s = f.competitors[id]?.status;
        if (s === 'available') return 'Yes';
        if (s === 'not-available') return 'No';
        if (s === 'planned') return 'Planned';
        return '?';
      });
      md += `| ${f.name} | ${f.category} | ${statuses.join(' | ')} |\n`;
    }
    md += `\n`;
  }

  // Pricing changes
  if (pricing?.entries?.length > 0) {
    md += `## Recent Pricing Changes\n\n`;
    md += `| Competitor | Product | Previous | Current | Effective |\n`;
    md += `|-----------|---------|----------|---------|----------|\n`;
    for (const p of pricing.entries.slice(-10)) {
      md += `| ${p.competitor} | ${p.product} | ${p.previousValue || '—'} | ${p.newValue} | ${p.effectiveDate} |\n`;
    }
    md += `\n`;
  }

  // Releases
  if (releases?.releases?.length > 0) {
    md += `## Recent Releases\n\n`;
    md += `| Date | Competitor | Feature | Category | Impact |\n`;
    md += `|------|-----------|---------|----------|--------|\n`;
    for (const r of releases.releases.slice(-10).reverse()) {
      md += `| ${r.date} | ${r.competitor} | ${r.feature} | ${r.category} | ${r.impact} |\n`;
    }
    md += `\n`;
  }

  // Perception themes
  if (perception?.entries?.length > 0) {
    md += `## Customer Perception Themes\n\n`;
    const byCompetitor = {};
    for (const p of perception.entries) {
      if (!byCompetitor[p.competitor]) byCompetitor[p.competitor] = [];
      byCompetitor[p.competitor].push(p);
    }

    for (const [comp, entries] of Object.entries(byCompetitor)) {
      const compName = competitors.competitors.find(c => c.id === comp)?.name || comp;
      md += `### ${compName}\n`;
      for (const e of entries) {
        const sentimentIcon = e.sentiment === 'positive' ? '+' : e.sentiment === 'negative' ? '-' : '~';
        md += `- [${sentimentIcon}] **${e.theme}** (${e.period}) — ${e.summary}\n`;
      }
      md += `\n`;
    }
  }

  // Write output
  const outputDir = path.join(getSharedDir(), 'reports');
  await fs.ensureDir(outputDir);
  const outputPath = path.join(outputDir, `competitive-summary-${periodVal}.md`);
  await fs.writeFile(outputPath, md);

  spinner.succeed('Competitive summary generated');
  console.log(chalk.yellow(`\nOutput: ${outputPath}\n`));
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function getCurrentQuarter() {
  const now = new Date();
  return `${now.getFullYear()}-Q${Math.ceil((now.getMonth() + 1) / 3)}`;
}
