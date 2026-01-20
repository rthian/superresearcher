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

// Serve command - Start web UI server
program
  .command('serve')
  .description('Start the web UI server')
  .option('-p, --port <number>', 'Port number (default: 3000)', '3000')
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

// Parse arguments
program.parse();
