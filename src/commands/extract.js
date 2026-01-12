import chalk from 'chalk';
import ora from 'ora';
import { 
  projectExists, 
  getProjectDir,
  readStudyMetadata,
  readMethodology,
  readTranscripts,
  readSurveys,
  readProjectConfig
} from '../utils/files.js';
import { writePrompt, generateExtractionPrompt } from '../utils/prompts.js';
import { isAgentAvailable, runWithAgent, displayManualInstructions } from '../utils/agent.js';
import { trackCommand } from '../utils/telemetry.js';

export async function extractCommand(project, options) {
  const spinner = ora('Preparing extraction...').start();
  
  try {
    // Track command (unless disabled)
    if (options.telemetry !== false) {
      trackCommand('extract', { hasAgent: options.agent });
    }
    
    // Check if project exists
    if (!await projectExists(project)) {
      spinner.fail(`Project "${project}" not found`);
      console.log(chalk.yellow(`\nAvailable projects can be listed with: superresearcher doctor`));
      process.exit(1);
    }
    
    const projectDir = getProjectDir(project);
    
    // Read project data
    spinner.text = 'Reading research data...';
    
    const [studyMetadata, methodology, transcripts, surveys, config] = await Promise.all([
      readStudyMetadata(project),
      readMethodology(project),
      readTranscripts(project),
      readSurveys(project),
      readProjectConfig(project)
    ]);
    
    // Validate we have data to process
    if (transcripts.length === 0 && surveys.length === 0) {
      spinner.fail('No research data found');
      console.log(chalk.yellow('\nAdd data to process:'));
      console.log(chalk.white(`  • Interview transcripts: ${chalk.cyan('context/transcripts/')}`));
      console.log(chalk.white(`  • Survey data: ${chalk.cyan('context/surveys/')}`));
      process.exit(1);
    }
    
    spinner.text = 'Generating extraction prompt...';
    
    // Generate the prompt
    const prompt = generateExtractionPrompt(
      studyMetadata,
      methodology,
      transcripts,
      surveys
    );
    
    // Write prompt file
    const promptPath = await writePrompt(project, 'extract', prompt);
    
    spinner.succeed('Extraction prompt ready');
    
    // Display data summary
    console.log(chalk.dim('\nResearch data summary:'));
    console.log(chalk.white(`  • Transcripts: ${transcripts.length}`));
    console.log(chalk.white(`  • Surveys: ${surveys.length}`));
    console.log(chalk.white(`  • Study type: ${config?.type || 'Unknown'}`));
    console.log('');
    
    // Run with agent or show manual instructions
    if (options.agent) {
      const agentAvailable = await isAgentAvailable();
      
      if (agentAvailable) {
        console.log(chalk.cyan('Running extraction with Cursor Agent...\n'));
        await runWithAgent(promptPath, projectDir);
        
        console.log(chalk.green('\n✅ Extraction complete!'));
        console.log(chalk.white(`\nNext steps:`));
        console.log(chalk.white(`  1. Review insights at ${chalk.cyan('insights/insights.md')}`));
        console.log(chalk.white(`  2. Run ${chalk.cyan(`superresearcher review ${project}`)} for quality check`));
      } else {
        displayManualInstructions(promptPath);
      }
    } else {
      console.log(chalk.green(`✅ Prompt generated: ${chalk.cyan(promptPath)}\n`));
      console.log(chalk.white('To extract insights:'));
      console.log(chalk.white(`  1. Open ${chalk.cyan(promptPath)} in Cursor`));
      console.log(chalk.white('  2. Run with Cursor AI (Cmd+L → select all → submit)'));
      console.log(chalk.white('  3. Review generated insights\n'));
      console.log(chalk.dim(`Or run with --agent flag for automated extraction:`));
      console.log(chalk.dim(`  superresearcher extract ${project} --agent\n`));
    }
    
  } catch (error) {
    spinner.fail('Extraction failed');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}
