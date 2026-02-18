#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { config } from 'dotenv';
import { initCommand } from './commands/init.js';
import { extractCommand } from './commands/extract.js';
import { reviewCommand } from './commands/review.js';
import { actionCommand } from './commands/action.js';
import { personaCommand } from './commands/persona.js';
import { auditCommand } from './commands/audit.js';
import { syncCommand } from './commands/sync.js';
import { doctorCommand } from './commands/doctor.js';
import { analyzeCommand } from './commands/analyze.js';
import { vocChunkToJsonCommand, vocConvertToChunksCommand } from './commands/voc.js';
import { serveCommand } from './commands/serve.js';
import { reportCommand } from './commands/report.js';
import {
  competitiveListCommand,
  competitiveAddFeatureCommand,
  competitiveAddPricingCommand,
  competitiveAddReleaseCommand,
  competitiveAddPerceptionCommand,
  competitiveSummaryCommand,
} from './commands/competitive.js';
import {
  roiTrackCommand,
  roiStatusCommand,
  roiReportCommand,
} from './commands/roi.js';
import { VERSION } from './config/constants.js';

// Load environment variables
config();

const program = new Command();

program
  .name('superresearcher')
  .description(chalk.cyan('🔬 Customer Insights Research Workflow for Cursor'))
  .version(VERSION);

// Init command - Create new research study project
program
  .command('init <name>')
  .description('Create a new research study project')
  .option('-t, --type <type>', 'Study type (interview, survey, usability, focus-group, observational)', 'interview')
  .option('--notion', 'Initialize with Notion sync enabled')
  .action(initCommand);

// Extract command - Extract insights from research files
program
  .command('extract <project>')
  .description('Extract insights from research files (transcripts, PDFs, surveys)')
  .option('--agent', 'Run with Cursor Agent automatically')
  .option('--source <source>', 'Specific source file to process')
  .option('--no-telemetry', 'Disable anonymous usage analytics')
  .action(extractCommand);

// Review command - Generate quality review of insights
program
  .command('review <project>')
  .description('Generate quality review of extracted insights')
  .option('--agent', 'Run with Cursor Agent automatically')
  .option('--focus <area>', 'Focus area: completeness, accuracy, actionability, coverage')
  .option('--no-telemetry', 'Disable anonymous usage analytics')
  .action(reviewCommand);

// Action command - Generate action items from insights
program
  .command('action <project>')
  .description('Generate action items from high-impact insights')
  .option('--agent', 'Run with Cursor Agent automatically')
  .option('--priority <level>', 'Filter by priority: critical, high, medium, low')
  .option('--department <dept>', 'Filter by department: product, engineering, design, marketing')
  .option('--no-telemetry', 'Disable anonymous usage analytics')
  .action(actionCommand);

// Persona command - Update personas based on insights
program
  .command('persona <project>')
  .description('Update or validate personas based on new insights')
  .option('--agent', 'Run with Cursor Agent automatically')
  .option('--create', 'Create new persona from insights')
  .option('--validate', 'Validate existing personas against new data')
  .option('--no-telemetry', 'Disable anonymous usage analytics')
  .action(personaCommand);

// Audit command - Run QA checks
program
  .command('audit [project]')
  .description('Run quality assurance checks on insights and data')
  .option('--fix', 'Attempt to auto-fix common issues')
  .option('--report', 'Generate detailed audit report')
  .action(auditCommand);

// Sync command - Sync with Notion
program
  .command('sync <project>')
  .description('Sync project data with Notion databases')
  .option('--push', 'Push local changes to Notion')
  .option('--pull', 'Pull latest from Notion')
  .option('--dry-run', 'Preview changes without applying')
  .action(syncCommand);

// Analyze command - Cross-study analysis
program
  .command('analyze')
  .description('Perform cross-study analysis across all projects')
  .option('--agent', 'Run with Cursor Agent automatically')
  .option('--themes', 'Identify common themes across studies')
  .option('--patterns', 'Detect behavioral patterns')
  .option('--gaps', 'Find research gaps and blind spots')
  .option('--no-telemetry', 'Disable anonymous usage analytics')
  .action(analyzeCommand);

// Doctor command - Check setup
program
  .command('doctor')
  .description('Check if everything is set up correctly')
  .action(doctorCommand);

// Report command - Generate report templates
program
  .command('report <type> [period]')
  .description('Generate report: strategic-brief (quarterly) or insight-backlog (monthly)')
  .action(reportCommand);

// Serve command - Start web UI server
program
  .command('serve')
  .description('Start the web UI server')
  .option('-p, --port <number>', 'Port number (default: 3000)', parseInt, 3000)
  .option('--no-browser', 'Don\'t open browser automatically')
  .option('--no-telemetry', 'Disable anonymous usage analytics')
  .action(serveCommand);

// VoC commands
const vocCommand = program
  .command('voc')
  .description('Voice of Customer (VoC) processing commands');

vocCommand
  .command('convert-to-chunks <input-file>')
  .description('Convert app store review format to chunked format')
  .option('--chunk-size <number>', 'Number of reviews per chunk (default: 20)', '20')
  .option('--no-telemetry', 'Disable anonymous usage analytics')
  .action(vocConvertToChunksCommand);

vocCommand
  .command('chunk-to-json <input-file>')
  .description('Convert chunked app store verbatims to structured JSON')
  .option('--agent', 'Run with Cursor Agent automatically')
  .option('--no-telemetry', 'Disable anonymous usage analytics')
  .action(vocChunkToJsonCommand);

// Competitive intelligence commands
const compCommand = program
  .command('competitive')
  .description('Competitive intelligence tracking commands');

compCommand
  .command('list')
  .description('List all tracked competitors')
  .action(competitiveListCommand);

compCommand
  .command('add-feature')
  .description('Add or update a feature for a competitor')
  .option('--name <name>', 'Feature name')
  .option('--category <category>', 'Feature category (savings, payments, lending, cards, rewards, onboarding, investments, insurance, ux, support)')
  .option('--competitor <id>', 'Competitor ID')
  .option('--status <status>', 'Status: available, planned, not-available, unknown')
  .option('--notes <notes>', 'Additional notes')
  .action(competitiveAddFeatureCommand);

compCommand
  .command('add-pricing')
  .description('Log a pricing change')
  .option('--competitor <id>', 'Competitor ID')
  .option('--category <category>', 'Category (savings, lending, cards, etc.)')
  .option('--product <product>', 'Product name')
  .option('--previous <value>', 'Previous value')
  .option('--current <value>', 'New/current value')
  .option('--source <source>', 'Data source')
  .option('--notes <notes>', 'Additional notes')
  .action(competitiveAddPricingCommand);

compCommand
  .command('add-release')
  .description('Log a competitor feature release')
  .option('--competitor <id>', 'Competitor ID')
  .option('--feature <feature>', 'Feature name')
  .option('--category <category>', 'Feature category')
  .option('--date <date>', 'Release date (YYYY-MM-DD)')
  .option('--source <source>', 'Data source')
  .option('--impact <impact>', 'Impact level: High, Medium, Low')
  .option('--notes <notes>', 'Additional notes')
  .action(competitiveAddReleaseCommand);

compCommand
  .command('add-perception')
  .description('Log a customer perception theme')
  .option('--competitor <id>', 'Competitor ID (or gxs/gxb)')
  .option('--theme <theme>', 'Perception theme')
  .option('--sentiment <sentiment>', 'Sentiment: positive, negative, mixed')
  .option('--source <source>', 'Data source')
  .option('--period <period>', 'Period (e.g. 2026-Q1)')
  .option('--summary <summary>', 'Brief summary')
  .option('--verbatim <verbatim>', 'Sample verbatim quote')
  .action(competitiveAddPerceptionCommand);

compCommand
  .command('summary [period]')
  .description('Generate quarterly competitive intelligence summary')
  .action(competitiveSummaryCommand);

// ROI tracking commands
const roiCommand = program
  .command('roi')
  .description('Close-the-loop ROI tracking: link actions to CSAT/NPS outcomes');

roiCommand
  .command('track')
  .description('Link an implemented action to a CSAT/NPS measurement period')
  .option('--action-id <id>', 'Action ID (e.g. action-001)')
  .option('--project <slug>', 'Project slug')
  .option('--period <period>', 'Implementation period (e.g. 2026-Q1)')
  .option('--organization <org>', 'Organization (GXS, GXB) for org-level metrics')
  .action(roiTrackCommand);

roiCommand
  .command('status')
  .description('Show all tracked actions and their metric impact')
  .action(roiStatusCommand);

roiCommand
  .command('report [period]')
  .description('Generate ROI report showing action impact on CSAT/NPS')
  .action(roiReportCommand);

// Parse arguments
program.parse();
