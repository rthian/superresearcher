import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { 
  listProjects,
  getProjectDir,
  getSharedDir,
  readInsights,
  readProjectConfig
} from '../utils/files.js';
import { writePrompt, generateAnalysisPrompt } from '../utils/prompts.js';
import { isAgentAvailable, runWithAgent, displayManualInstructions } from '../utils/agent.js';
import { trackCommand } from '../utils/telemetry.js';

export async function analyzeCommand(options) {
  const spinner = ora('Preparing cross-study analysis...').start();
  
  try {
    // Track command (unless disabled)
    if (options.telemetry !== false) {
      trackCommand('analyze', { 
        hasAgent: options.agent,
        themes: options.themes,
        patterns: options.patterns,
        gaps: options.gaps
      });
    }
    
    // Get all projects
    const projects = await listProjects();
    
    if (projects.length === 0) {
      spinner.fail('No projects found');
      console.log(chalk.yellow('\nCreate a project first:'));
      console.log(chalk.white('  superresearcher init "My Study"\n'));
      process.exit(1);
    }
    
    if (projects.length === 1) {
      spinner.warn('Only one project found');
      console.log(chalk.yellow('\nCross-study analysis works best with multiple projects.'));
      console.log(chalk.white('Continuing with single-project analysis...\n'));
    }
    
    spinner.text = `Loading data from ${projects.length} project(s)...`;
    
    // Collect all data
    const allStudies = [];
    const allInsights = [];
    
    for (const project of projects) {
      const [config, insights] = await Promise.all([
        readProjectConfig(project),
        readInsights(project)
      ]);
      
      if (config) {
        allStudies.push({
          id: project,
          name: config.name,
          type: config.type,
          status: config.status,
          createdAt: config.createdAt
        });
      }
      
      if (insights.insights) {
        allInsights.push(...insights.insights.map(i => ({
          ...i,
          sourceProject: project
        })));
      }
    }
    
    if (allInsights.length === 0) {
      spinner.fail('No insights found across projects');
      console.log(chalk.yellow('\nExtract insights first:'));
      console.log(chalk.white('  superresearcher extract <project>\n'));
      process.exit(1);
    }
    
    spinner.text = 'Generating analysis prompt...';
    
    // Generate the prompt
    const prompt = generateAnalysisPrompt(allStudies, allInsights, {
      themes: options.themes,
      patterns: options.patterns,
      gaps: options.gaps
    });
    
    // Ensure shared directory exists
    const sharedDir = getSharedDir();
    await fs.ensureDir(path.join(sharedDir, 'analysis'));
    await fs.ensureDir(path.join(sharedDir, 'themes'));
    await fs.ensureDir(path.join(sharedDir, 'patterns'));
    
    // Write prompt file
    const promptPath = path.join(sharedDir, 'analysis', 'analyze-prompt.md');
    await fs.writeFile(promptPath, prompt);
    
    spinner.succeed('Analysis prompt ready');
    
    // Display summary
    console.log(chalk.dim('\nAnalysis scope:'));
    console.log(chalk.white(`  • Studies: ${allStudies.length}`));
    console.log(chalk.white(`  • Total insights: ${allInsights.length}`));
    
    // Analysis types
    const analysisTypes = [];
    if (options.themes || (!options.themes && !options.patterns && !options.gaps)) {
      analysisTypes.push('Theme identification');
    }
    if (options.patterns || (!options.themes && !options.patterns && !options.gaps)) {
      analysisTypes.push('Pattern detection');
    }
    if (options.gaps || (!options.themes && !options.patterns && !options.gaps)) {
      analysisTypes.push('Gap analysis');
    }
    console.log(chalk.white(`  • Analysis types: ${analysisTypes.join(', ')}`));
    
    // Breakdown by category
    const byCategory = {};
    for (const insight of allInsights) {
      const cat = insight.category || 'Uncategorized';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    }
    console.log(chalk.dim('\n  Insights by category:'));
    for (const [cat, count] of Object.entries(byCategory)) {
      console.log(chalk.dim(`    - ${cat}: ${count}`));
    }
    console.log('');
    
    // Run with agent or show manual instructions
    if (options.agent) {
      const agentAvailable = await isAgentAvailable();
      
      if (agentAvailable) {
        console.log(chalk.cyan('Running cross-study analysis with Cursor Agent...\n'));
        await runWithAgent(promptPath, sharedDir);
        
        console.log(chalk.green('\n✅ Analysis complete!'));
        console.log(chalk.white(`\nOutputs:`));
        console.log(chalk.white(`  • ${chalk.cyan('shared/analysis/cross-study-analysis.md')}`));
        console.log(chalk.white(`  • ${chalk.cyan('shared/themes/themes.json')}`));
        console.log(chalk.white(`  • ${chalk.cyan('shared/patterns/patterns.json')}`));
      } else {
        displayManualInstructions(promptPath);
      }
    } else {
      console.log(chalk.green(`✅ Prompt generated: ${chalk.cyan(promptPath)}\n`));
      console.log(chalk.white('To run analysis:'));
      console.log(chalk.white(`  1. Open ${chalk.cyan(promptPath)} in Cursor`));
      console.log(chalk.white('  2. Run with Cursor AI'));
      console.log(chalk.white('  3. Review cross-study findings\n'));
    }
    
  } catch (error) {
    spinner.fail('Analysis failed');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}
