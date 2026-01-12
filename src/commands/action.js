import chalk from 'chalk';
import ora from 'ora';
import { 
  projectExists, 
  getProjectDir,
  readStudyMetadata,
  readInsights
} from '../utils/files.js';
import { writePrompt, generateActionPrompt } from '../utils/prompts.js';
import { isAgentAvailable, runWithAgent, displayManualInstructions } from '../utils/agent.js';
import { trackCommand } from '../utils/telemetry.js';

export async function actionCommand(project, options) {
  const spinner = ora('Preparing action item generation...').start();
  
  try {
    // Track command (unless disabled)
    if (options.telemetry !== false) {
      trackCommand('action', { 
        hasAgent: options.agent, 
        priority: options.priority,
        department: options.department 
      });
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
    
    // Validate we have insights
    if (!insightsData.insights || insightsData.insights.length === 0) {
      spinner.fail('No insights found');
      console.log(chalk.yellow('\nExtract insights first:'));
      console.log(chalk.white(`  superresearcher extract ${project}\n`));
      process.exit(1);
    }
    
    // Filter insights if priority specified
    let filteredInsights = insightsData.insights;
    
    if (options.priority) {
      const priorityMap = {
        'critical': ['Critical', 'High'],
        'high': ['High'],
        'medium': ['Medium'],
        'low': ['Low']
      };
      const allowedImpacts = priorityMap[options.priority.toLowerCase()] || [];
      filteredInsights = insightsData.insights.filter(i => 
        allowedImpacts.includes(i.impactLevel) || allowedImpacts.includes(i.priority)
      );
      
      if (filteredInsights.length === 0) {
        spinner.fail(`No ${options.priority} priority insights found`);
        process.exit(1);
      }
    }
    
    spinner.text = 'Generating action prompt...';
    
    // Generate the prompt
    const prompt = generateActionPrompt(
      studyMetadata,
      { ...insightsData, insights: filteredInsights },
      { priority: options.priority, department: options.department }
    );
    
    // Write prompt file
    const promptPath = await writePrompt(project, 'action', prompt);
    
    spinner.succeed('Action prompt ready');
    
    // Display summary
    console.log(chalk.dim('\nInsights to process:'));
    console.log(chalk.white(`  • Total: ${filteredInsights.length}`));
    
    // Count by impact
    const byImpact = { High: 0, Medium: 0, Low: 0 };
    for (const insight of filteredInsights) {
      const impact = insight.impactLevel || 'Medium';
      byImpact[impact] = (byImpact[impact] || 0) + 1;
    }
    console.log(chalk.white(`    - High impact: ${byImpact.High}`));
    console.log(chalk.white(`    - Medium impact: ${byImpact.Medium}`));
    console.log(chalk.white(`    - Low impact: ${byImpact.Low}`));
    
    if (options.department) {
      console.log(chalk.white(`  • Focus department: ${options.department}`));
    }
    console.log('');
    
    // Run with agent or show manual instructions
    if (options.agent) {
      const agentAvailable = await isAgentAvailable();
      
      if (agentAvailable) {
        console.log(chalk.cyan('Generating action items with Cursor Agent...\n'));
        await runWithAgent(promptPath, projectDir);
        
        console.log(chalk.green('\n✅ Action items generated!'));
        console.log(chalk.white(`\nOutput:`));
        console.log(chalk.white(`  • ${chalk.cyan('actions/actions.md')} - Human readable`));
        console.log(chalk.white(`  • ${chalk.cyan('actions/actions.json')} - For Notion sync`));
      } else {
        displayManualInstructions(promptPath);
      }
    } else {
      console.log(chalk.green(`✅ Prompt generated: ${chalk.cyan(promptPath)}\n`));
      console.log(chalk.white('To generate action items:'));
      console.log(chalk.white(`  1. Open ${chalk.cyan(promptPath)} in Cursor`));
      console.log(chalk.white('  2. Run with Cursor AI'));
      console.log(chalk.white('  3. Review generated actions\n'));
    }
    
  } catch (error) {
    spinner.fail('Action generation failed');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}
