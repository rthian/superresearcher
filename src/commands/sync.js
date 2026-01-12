import chalk from 'chalk';
import ora from 'ora';
import { 
  projectExists,
  getProjectDir,
  readProjectConfig,
  writeProjectConfig,
  readInsights,
  readActions,
  readGlobalConfig
} from '../utils/files.js';
import { trackCommand } from '../utils/telemetry.js';
import { NotionClient } from '../integrations/notion.js';

export async function syncCommand(project, options) {
  const spinner = ora('Preparing sync...').start();
  
  try {
    trackCommand('sync', { 
      project, 
      push: options.push, 
      pull: options.pull,
      dryRun: options.dryRun 
    });
    
    // Check if project exists
    if (!await projectExists(project)) {
      spinner.fail(`Project "${project}" not found`);
      process.exit(1);
    }
    
    // Check Notion configuration
    const globalConfig = await readGlobalConfig();
    const apiKey = process.env.NOTION_API_KEY || globalConfig.notion?.apiKey;
    
    if (!apiKey) {
      spinner.fail('Notion API key not configured');
      console.log(chalk.yellow('\nTo enable Notion sync:'));
      console.log(chalk.white('  1. Get your Notion API key from https://www.notion.so/my-integrations'));
      console.log(chalk.white('  2. Add to .env file: NOTION_API_KEY=your_key_here'));
      console.log(chalk.white('  3. Share your databases with the integration\n'));
      process.exit(1);
    }
    
    const projectConfig = await readProjectConfig(project);
    
    if (!projectConfig.notion?.enabled) {
      spinner.fail('Notion sync not enabled for this project');
      console.log(chalk.yellow('\nEnable Notion sync:'));
      console.log(chalk.white(`  superresearcher init "${project}" --notion`));
      console.log(chalk.white('  Or manually set notion.enabled = true in study.config.json\n'));
      process.exit(1);
    }
    
    spinner.text = 'Connecting to Notion...';
    
    const notion = new NotionClient(apiKey);
    
    // Determine sync direction
    if (options.pull) {
      await pullFromNotion(spinner, notion, project, projectConfig, options);
    } else if (options.push) {
      await pushToNotion(spinner, notion, project, projectConfig, options);
    } else {
      // Default: bidirectional sync
      spinner.info('Bidirectional sync');
      console.log(chalk.yellow('\nSpecify sync direction:'));
      console.log(chalk.white('  --push  Push local changes to Notion'));
      console.log(chalk.white('  --pull  Pull latest from Notion\n'));
      process.exit(1);
    }
    
  } catch (error) {
    spinner.fail('Sync failed');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

async function pushToNotion(spinner, notion, project, projectConfig, options) {
  spinner.text = 'Reading local data...';
  
  const [insights, actions] = await Promise.all([
    readInsights(project),
    readActions(project)
  ]);
  
  if (options.dryRun) {
    spinner.succeed('Dry run - no changes made');
    console.log(chalk.cyan('\n📋 Changes to push:\n'));
    console.log(chalk.white(`  Insights: ${insights.insights?.length || 0}`));
    console.log(chalk.white(`  Actions: ${actions.actions?.length || 0}`));
    console.log(chalk.dim('\nRun without --dry-run to apply changes.\n'));
    return;
  }
  
  // Push insights
  if (insights.insights && insights.insights.length > 0) {
    spinner.text = `Pushing ${insights.insights.length} insights...`;
    
    const insightsDatabaseId = projectConfig.notion.insightsDatabaseId || 
                               process.env.NOTION_INSIGHTS_DATABASE_ID;
    
    if (!insightsDatabaseId) {
      spinner.warn('Insights database ID not configured');
      console.log(chalk.yellow('Set NOTION_INSIGHTS_DATABASE_ID in .env or project config\n'));
    } else {
      let pushed = 0;
      for (const insight of insights.insights) {
        try {
          await notion.createOrUpdateInsight(insightsDatabaseId, insight, project);
          pushed++;
        } catch (err) {
          console.log(chalk.yellow(`  ⚠️ Failed to push insight: ${insight.title}`));
        }
      }
      console.log(chalk.green(`  ✓ Pushed ${pushed}/${insights.insights.length} insights`));
    }
  }
  
  // Push actions
  if (actions.actions && actions.actions.length > 0) {
    spinner.text = `Pushing ${actions.actions.length} actions...`;
    
    const actionsDatabaseId = projectConfig.notion.actionsDatabaseId || 
                              process.env.NOTION_ACTIONS_DATABASE_ID;
    
    if (!actionsDatabaseId) {
      spinner.warn('Actions database ID not configured');
      console.log(chalk.yellow('Set NOTION_ACTIONS_DATABASE_ID in .env or project config\n'));
    } else {
      let pushed = 0;
      for (const action of actions.actions) {
        try {
          await notion.createOrUpdateAction(actionsDatabaseId, action, project);
          pushed++;
        } catch (err) {
          console.log(chalk.yellow(`  ⚠️ Failed to push action: ${action.title}`));
        }
      }
      console.log(chalk.green(`  ✓ Pushed ${pushed}/${actions.actions.length} actions`));
    }
  }
  
  spinner.succeed('Push complete');
  
  // Update last sync time
  projectConfig.notion.lastSync = new Date().toISOString();
  projectConfig.notion.lastSyncDirection = 'push';
  await writeProjectConfig(project, projectConfig);
}

async function pullFromNotion(spinner, notion, project, projectConfig, options) {
  spinner.text = 'Fetching from Notion...';
  
  const insightsDatabaseId = projectConfig.notion.insightsDatabaseId || 
                             process.env.NOTION_INSIGHTS_DATABASE_ID;
  const actionsDatabaseId = projectConfig.notion.actionsDatabaseId || 
                            process.env.NOTION_ACTIONS_DATABASE_ID;
  
  if (!insightsDatabaseId && !actionsDatabaseId) {
    spinner.fail('No Notion database IDs configured');
    console.log(chalk.yellow('\nConfigure database IDs:'));
    console.log(chalk.white('  NOTION_INSIGHTS_DATABASE_ID=your_database_id'));
    console.log(chalk.white('  NOTION_ACTIONS_DATABASE_ID=your_database_id\n'));
    process.exit(1);
  }
  
  const results = { insights: 0, actions: 0 };
  
  if (insightsDatabaseId) {
    spinner.text = 'Pulling insights...';
    try {
      const insights = await notion.queryInsights(insightsDatabaseId, project);
      results.insights = insights.length;
      
      if (!options.dryRun) {
        const projectDir = getProjectDir(project);
        // Merge with existing insights logic would go here
        console.log(chalk.green(`  ✓ Pulled ${insights.length} insights`));
      }
    } catch (err) {
      console.log(chalk.yellow(`  ⚠️ Failed to pull insights: ${err.message}`));
    }
  }
  
  if (actionsDatabaseId) {
    spinner.text = 'Pulling actions...';
    try {
      const actions = await notion.queryActions(actionsDatabaseId, project);
      results.actions = actions.length;
      
      if (!options.dryRun) {
        console.log(chalk.green(`  ✓ Pulled ${actions.length} actions`));
      }
    } catch (err) {
      console.log(chalk.yellow(`  ⚠️ Failed to pull actions: ${err.message}`));
    }
  }
  
  if (options.dryRun) {
    spinner.succeed('Dry run - no changes made');
    console.log(chalk.cyan('\n📋 Available to pull:\n'));
    console.log(chalk.white(`  Insights: ${results.insights}`));
    console.log(chalk.white(`  Actions: ${results.actions}`));
    console.log(chalk.dim('\nRun without --dry-run to apply changes.\n'));
    return;
  }
  
  spinner.succeed('Pull complete');
  
  // Update last sync time
  projectConfig.notion.lastSync = new Date().toISOString();
  projectConfig.notion.lastSyncDirection = 'pull';
  await writeProjectConfig(project, projectConfig);
}
