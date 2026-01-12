import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { 
  listProjects,
  getProjectDir,
  readInsights,
  readActions,
  readSharedPersonas,
  readProjectConfig
} from '../utils/files.js';
import { writePrompt, generateAuditPrompt } from '../utils/prompts.js';
import { trackCommand } from '../utils/telemetry.js';

export async function auditCommand(project, options) {
  const spinner = ora('Running audit...').start();
  
  try {
    trackCommand('audit', { project: project || 'all', fix: options.fix });
    
    let projectsToAudit = [];
    
    if (project) {
      projectsToAudit = [project];
    } else {
      projectsToAudit = await listProjects();
    }
    
    if (projectsToAudit.length === 0) {
      spinner.fail('No projects found to audit');
      process.exit(1);
    }
    
    spinner.text = `Auditing ${projectsToAudit.length} project(s)...`;
    
    // Collect all data
    const allInsights = [];
    const allActions = [];
    const projectConfigs = [];
    
    for (const proj of projectsToAudit) {
      const [insights, actions, config] = await Promise.all([
        readInsights(proj),
        readActions(proj),
        readProjectConfig(proj)
      ]);
      
      allInsights.push(...(insights.insights || []).map(i => ({ ...i, project: proj })));
      allActions.push(...(actions.actions || []).map(a => ({ ...a, project: proj })));
      if (config) {
        projectConfigs.push({ ...config, project: proj });
      }
    }
    
    const personas = await readSharedPersonas();
    
    spinner.succeed('Data collected');
    
    // Run audit checks
    console.log(chalk.cyan('\n🔍 Audit Results\n'));
    
    const issues = {
      critical: [],
      warning: [],
      info: []
    };
    
    // Check 1: Insights without source studies
    const insightsWithoutSource = allInsights.filter(i => !i.source && !i.sourceStudy);
    if (insightsWithoutSource.length > 0) {
      issues.warning.push({
        check: 'Unlinked Insights',
        count: insightsWithoutSource.length,
        details: insightsWithoutSource.map(i => `${i.project}: ${i.title || i.id}`).slice(0, 5)
      });
    }
    
    // Check 2: Actions without source insights
    const actionsWithoutInsight = allActions.filter(a => !a.sourceInsight);
    if (actionsWithoutInsight.length > 0) {
      issues.warning.push({
        check: 'Actions Without Source Insights',
        count: actionsWithoutInsight.length,
        details: actionsWithoutInsight.map(a => `${a.project}: ${a.title || a.id}`).slice(0, 5)
      });
    }
    
    // Check 3: Insights missing required fields
    const incompleteInsights = allInsights.filter(i => 
      !i.title || !i.category || !i.evidence
    );
    if (incompleteInsights.length > 0) {
      issues.warning.push({
        check: 'Incomplete Insights',
        count: incompleteInsights.length,
        details: incompleteInsights.map(i => {
          const missing = [];
          if (!i.title) missing.push('title');
          if (!i.category) missing.push('category');
          if (!i.evidence) missing.push('evidence');
          return `${i.project}: Missing ${missing.join(', ')}`;
        }).slice(0, 5)
      });
    }
    
    // Check 4: High-priority actions without owners
    const unownedHighPriority = allActions.filter(a => 
      ['Critical', 'High'].includes(a.priority) && !a.owner
    );
    if (unownedHighPriority.length > 0) {
      issues.critical.push({
        check: 'Unowned High-Priority Actions',
        count: unownedHighPriority.length,
        details: unownedHighPriority.map(a => `${a.project}: ${a.title}`).slice(0, 5)
      });
    }
    
    // Check 5: Stale actions (not started, older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const staleActions = allActions.filter(a => {
      if (a.status !== 'Not Started') return false;
      const created = new Date(a.createdAt || a.dateCreated);
      return !isNaN(created) && created < thirtyDaysAgo;
    });
    if (staleActions.length > 0) {
      issues.warning.push({
        check: 'Stale Action Items',
        count: staleActions.length,
        details: staleActions.map(a => `${a.project}: ${a.title}`).slice(0, 5)
      });
    }
    
    // Check 6: Personas without recent insights (90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const stalePersonas = (personas.personas || []).filter(p => {
      const updated = new Date(p.lastUpdated);
      return !isNaN(updated) && updated < ninetyDaysAgo;
    });
    if (stalePersonas.length > 0) {
      issues.info.push({
        check: 'Personas Need Refresh',
        count: stalePersonas.length,
        details: stalePersonas.map(p => p.name)
      });
    }
    
    // Check 7: Category consistency
    const categories = new Set(allInsights.map(i => i.category).filter(Boolean));
    const validCategories = new Set([
      'Pain Point', 'Opportunity', 'Behavior', 'Preference', 
      'Unmet Need', 'Bug Report', 'Positive Feedback'
    ]);
    const invalidCategories = [...categories].filter(c => !validCategories.has(c));
    if (invalidCategories.length > 0) {
      issues.info.push({
        check: 'Non-standard Categories',
        count: invalidCategories.length,
        details: invalidCategories
      });
    }
    
    // Display results
    const totalIssues = issues.critical.length + issues.warning.length + issues.info.length;
    
    // Summary stats
    console.log(chalk.white('📊 Data Summary'));
    console.log(chalk.dim('─'.repeat(40)));
    console.log(chalk.white(`  Projects:  ${projectsToAudit.length}`));
    console.log(chalk.white(`  Insights:  ${allInsights.length}`));
    console.log(chalk.white(`  Actions:   ${allActions.length}`));
    console.log(chalk.white(`  Personas:  ${personas.personas?.length || 0}`));
    console.log('');
    
    if (totalIssues === 0) {
      console.log(chalk.green('✅ No issues found! Data quality is good.\n'));
    } else {
      // Critical issues
      if (issues.critical.length > 0) {
        console.log(chalk.red('🚨 Critical Issues'));
        console.log(chalk.dim('─'.repeat(40)));
        for (const issue of issues.critical) {
          console.log(chalk.red(`  ✗ ${issue.check}: ${issue.count}`));
          for (const detail of issue.details) {
            console.log(chalk.dim(`      • ${detail}`));
          }
        }
        console.log('');
      }
      
      // Warnings
      if (issues.warning.length > 0) {
        console.log(chalk.yellow('⚠️  Warnings'));
        console.log(chalk.dim('─'.repeat(40)));
        for (const issue of issues.warning) {
          console.log(chalk.yellow(`  ○ ${issue.check}: ${issue.count}`));
          for (const detail of issue.details) {
            console.log(chalk.dim(`      • ${detail}`));
          }
        }
        console.log('');
      }
      
      // Info
      if (issues.info.length > 0) {
        console.log(chalk.blue('ℹ️  Info'));
        console.log(chalk.dim('─'.repeat(40)));
        for (const issue of issues.info) {
          console.log(chalk.blue(`  ○ ${issue.check}: ${issue.count}`));
          for (const detail of issue.details) {
            console.log(chalk.dim(`      • ${detail}`));
          }
        }
        console.log('');
      }
      
      // Score
      const score = Math.max(0, 10 - (issues.critical.length * 3) - (issues.warning.length * 1) - (issues.info.length * 0.25));
      const scoreColor = score >= 8 ? chalk.green : score >= 5 ? chalk.yellow : chalk.red;
      console.log(chalk.white(`Quality Score: ${scoreColor(score.toFixed(1))}/10\n`));
    }
    
    // Generate detailed report if requested
    if (options.report) {
      const reportPath = path.join(process.cwd(), 'audit-report.md');
      const report = generateAuditReport(projectsToAudit, allInsights, allActions, personas, issues);
      await fs.writeFile(reportPath, report);
      console.log(chalk.green(`📄 Detailed report: ${chalk.cyan(reportPath)}\n`));
    }
    
  } catch (error) {
    spinner.fail('Audit failed');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

function generateAuditReport(projects, insights, actions, personas, issues) {
  const now = new Date().toISOString();
  
  let report = `# Research Repository Audit Report

**Audit Date:** ${now}
**Projects Audited:** ${projects.length}

---

## Summary

| Metric | Count |
|--------|-------|
| Total Projects | ${projects.length} |
| Total Insights | ${insights.length} |
| Total Actions | ${actions.length} |
| Total Personas | ${personas.personas?.length || 0} |

### Issue Summary

| Severity | Count |
|----------|-------|
| 🚨 Critical | ${issues.critical.length} |
| ⚠️ Warning | ${issues.warning.length} |
| ℹ️ Info | ${issues.info.length} |

---

## Critical Issues

${issues.critical.length === 0 ? 'None' : issues.critical.map(i => 
  `### ${i.check}\n**Count:** ${i.count}\n\n${i.details.map(d => `- ${d}`).join('\n')}`
).join('\n\n')}

---

## Warnings

${issues.warning.length === 0 ? 'None' : issues.warning.map(i => 
  `### ${i.check}\n**Count:** ${i.count}\n\n${i.details.map(d => `- ${d}`).join('\n')}`
).join('\n\n')}

---

## Info

${issues.info.length === 0 ? 'None' : issues.info.map(i => 
  `### ${i.check}\n**Count:** ${i.count}\n\n${i.details.map(d => `- ${d}`).join('\n')}`
).join('\n\n')}

---

## Recommendations

1. Address all critical issues immediately
2. Review and fix warnings within the next sprint
3. Consider info items during regular maintenance

---

*Generated by SuperResearcher*
`;

  return report;
}
