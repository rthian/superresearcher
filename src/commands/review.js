import chalk from 'chalk';
import ora from 'ora';
import { 
  projectExists, 
  getProjectDir,
  readStudyMetadata,
  readInsights
} from '../utils/files.js';
import { writePrompt, generateReviewPrompt } from '../utils/prompts.js';
import { isAgentAvailable, runWithAgent, displayManualInstructions } from '../utils/agent.js';
import { trackCommand } from '../utils/telemetry.js';

export async function reviewCommand(project, options) {
  const spinner = ora('Preparing review...').start();
  
  try {
    // Track command (unless disabled)
    if (options.telemetry !== false) {
      trackCommand('review', { hasAgent: options.agent, focus: options.focus });
    }
    
    // Check if project exists
    if (!await projectExists(project)) {
      spinner.fail(`Project "${project}" not found`);
      process.exit(1);
    }
    
    const projectDir = getProjectDir(project);
    
    // Read project data
    spinner.text = 'Reading insights data...';
    
    const [studyMetadata, insightsData] = await Promise.all([
      readStudyMetadata(project),
      readInsights(project)
    ]);
    
    // Validate we have insights to review
    if (!insightsData.insights || insightsData.insights.length === 0) {
      spinner.fail('No insights found to review');
      console.log(chalk.yellow('\nExtract insights first:'));
      console.log(chalk.white(`  superresearcher extract ${project}\n`));
      process.exit(1);
    }
    
    spinner.text = 'Generating review prompt...';
    
    // Generate the prompt
    const prompt = generateReviewPrompt(
      studyMetadata,
      insightsData,
      options.focus
    );
    
    // Write prompt file
    const promptPath = await writePrompt(project, 'review', prompt);
    
    spinner.succeed('Review prompt ready');
    
    // Display insights summary
    console.log(chalk.dim('\nInsights summary:'));
    console.log(chalk.white(`  • Total insights: ${insightsData.insights.length}`));
    
    // Count by category
    const byCategory = {};
    for (const insight of insightsData.insights) {
      const cat = insight.category || 'Uncategorized';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    }
    for (const [cat, count] of Object.entries(byCategory)) {
      console.log(chalk.white(`    - ${cat}: ${count}`));
    }
    
    if (options.focus) {
      console.log(chalk.white(`  • Focus area: ${options.focus}`));
    }
    console.log('');
    
    // Run with agent or show manual instructions
    if (options.agent) {
      const agentAvailable = await isAgentAvailable();
      
      if (agentAvailable) {
        console.log(chalk.cyan('Running review with Cursor Agent...\n'));
        await runWithAgent(promptPath, projectDir);
        
        console.log(chalk.green('\n✅ Review complete!'));
        console.log(chalk.white(`\nReview output: ${chalk.cyan('insights/review.md')}`));
      } else {
        displayManualInstructions(promptPath);
      }
    } else {
      console.log(chalk.green(`✅ Prompt generated: ${chalk.cyan(promptPath)}\n`));
      console.log(chalk.white('To run review:'));
      console.log(chalk.white(`  1. Open ${chalk.cyan(promptPath)} in Cursor`));
      console.log(chalk.white('  2. Run with Cursor AI'));
      console.log(chalk.white('  3. Review quality findings\n'));
    }
    
  } catch (error) {
    spinner.fail('Review failed');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}
