import chalk from 'chalk';
import ora from 'ora';
import { 
  projectExists, 
  getProjectDir,
  readStudyMetadata,
  readInsights,
  readSharedPersonas
} from '../utils/files.js';
import { writePrompt, generatePersonaPrompt } from '../utils/prompts.js';
import { isAgentAvailable, runWithAgent, displayManualInstructions } from '../utils/agent.js';
import { trackCommand } from '../utils/telemetry.js';

export async function personaCommand(project, options) {
  const spinner = ora('Preparing persona analysis...').start();
  
  try {
    // Track command (unless disabled)
    if (options.telemetry !== false) {
      trackCommand('persona', { 
        hasAgent: options.agent, 
        create: options.create,
        validate: options.validate 
      });
    }
    
    // Check if project exists
    if (!await projectExists(project)) {
      spinner.fail(`Project "${project}" not found`);
      process.exit(1);
    }
    
    const projectDir = getProjectDir(project);
    
    // Read project data
    spinner.text = 'Reading data...';
    
    const [studyMetadata, insightsData, existingPersonas] = await Promise.all([
      readStudyMetadata(project),
      readInsights(project),
      readSharedPersonas()
    ]);
    
    // Validate we have insights
    if (!insightsData.insights || insightsData.insights.length === 0) {
      spinner.fail('No insights found');
      console.log(chalk.yellow('\nExtract insights first:'));
      console.log(chalk.white(`  superresearcher extract ${project}\n`));
      process.exit(1);
    }
    
    spinner.text = 'Generating persona prompt...';
    
    // Determine mode
    const mode = options.create ? 'create' : options.validate ? 'validate' : 'update';
    
    // Generate the prompt
    const prompt = generatePersonaPrompt(
      studyMetadata,
      insightsData,
      existingPersonas,
      { create: options.create, validate: options.validate }
    );
    
    // Write prompt file
    const promptPath = await writePrompt(project, 'persona', prompt);
    
    spinner.succeed('Persona prompt ready');
    
    // Display summary
    console.log(chalk.dim('\nAnalysis context:'));
    console.log(chalk.white(`  • Insights to analyze: ${insightsData.insights.length}`));
    console.log(chalk.white(`  • Existing personas: ${existingPersonas.personas?.length || 0}`));
    console.log(chalk.white(`  • Mode: ${mode}`));
    
    // Show existing personas
    if (existingPersonas.personas && existingPersonas.personas.length > 0) {
      console.log(chalk.dim('\nExisting personas:'));
      for (const persona of existingPersonas.personas) {
        const type = persona.type ? `(${persona.type})` : '';
        console.log(chalk.white(`    • ${persona.name} ${type}`));
      }
    }
    console.log('');
    
    // Run with agent or show manual instructions
    if (options.agent) {
      const agentAvailable = await isAgentAvailable();
      
      if (agentAvailable) {
        console.log(chalk.cyan('Running persona analysis with Cursor Agent...\n'));
        await runWithAgent(promptPath, projectDir);
        
        console.log(chalk.green('\n✅ Persona analysis complete!'));
        console.log(chalk.white(`\nOutput:`));
        console.log(chalk.white(`  • ${chalk.cyan('personas/updates.md')} - Update summary`));
        console.log(chalk.white(`  • ${chalk.cyan('personas/updates.json')} - For Notion sync`));
        
        if (options.create) {
          console.log(chalk.yellow(`\n⚠️  Review new personas and run:`));
          console.log(chalk.white(`  superresearcher sync ${project} --push`));
          console.log(chalk.white(`  to update shared personas.`));
        }
      } else {
        displayManualInstructions(promptPath);
      }
    } else {
      console.log(chalk.green(`✅ Prompt generated: ${chalk.cyan(promptPath)}\n`));
      console.log(chalk.white('To run persona analysis:'));
      console.log(chalk.white(`  1. Open ${chalk.cyan(promptPath)} in Cursor`));
      console.log(chalk.white('  2. Run with Cursor AI'));
      console.log(chalk.white('  3. Review persona updates\n'));
    }
    
  } catch (error) {
    spinner.fail('Persona analysis failed');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}
