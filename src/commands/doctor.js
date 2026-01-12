import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { 
  getProjectsDir, 
  getSharedDir, 
  readGlobalConfig,
  listProjects 
} from '../utils/files.js';
import { isAgentAvailable } from '../utils/agent.js';

export async function doctorCommand() {
  console.log(chalk.cyan('\n🔬 SuperResearcher Doctor\n'));
  console.log(chalk.dim('Checking your setup...\n'));
  
  const checks = [];
  
  // Check Node.js version
  const nodeVersion = process.version;
  const nodeMajor = parseInt(nodeVersion.slice(1).split('.')[0]);
  checks.push({
    name: 'Node.js version',
    passed: nodeMajor >= 18,
    message: nodeMajor >= 18 
      ? `${nodeVersion} ✓` 
      : `${nodeVersion} (requires 18+)`,
    fix: 'Install Node.js 18 or later: https://nodejs.org'
  });
  
  // Check if in a superresearcher project
  const configPath = path.join(process.cwd(), '.superresearcher', 'config.json');
  const hasGlobalConfig = await fs.pathExists(configPath);
  checks.push({
    name: 'SuperResearcher initialized',
    passed: hasGlobalConfig,
    message: hasGlobalConfig ? 'Found .superresearcher/config.json' : 'Not initialized',
    fix: 'Run any superresearcher command to initialize, or create .superresearcher/config.json'
  });
  
  // Check projects directory
  const projectsDir = getProjectsDir();
  const hasProjectsDir = await fs.pathExists(projectsDir);
  const projects = hasProjectsDir ? await listProjects() : [];
  checks.push({
    name: 'Projects directory',
    passed: hasProjectsDir,
    message: hasProjectsDir 
      ? `Found ${projects.length} project(s)` 
      : 'Not found',
    fix: `Create projects directory or run: superresearcher init "My First Study"`
  });
  
  // Check shared directory structure
  const sharedDir = getSharedDir();
  const hasSharedDir = await fs.pathExists(sharedDir);
  checks.push({
    name: 'Shared resources directory',
    passed: hasSharedDir,
    message: hasSharedDir ? 'Found shared/' : 'Not found (optional)',
    fix: 'Will be created when needed',
    optional: true
  });
  
  // Check for Cursor Agent CLI
  const hasAgent = await isAgentAvailable();
  checks.push({
    name: 'Cursor Agent CLI',
    passed: hasAgent,
    message: hasAgent ? 'Available' : 'Not found (optional)',
    fix: 'Install Cursor CLI: curl https://cursor.com/install -fsS | bash && agent login',
    optional: true
  });
  
  // Check for .env file
  const envPath = path.join(process.cwd(), '.env');
  const hasEnv = await fs.pathExists(envPath);
  checks.push({
    name: 'Environment file (.env)',
    passed: hasEnv,
    message: hasEnv ? 'Found' : 'Not found (optional for Notion sync)',
    fix: 'Copy .env.example to .env and configure',
    optional: true
  });
  
  // Check Notion configuration
  if (hasGlobalConfig) {
    const config = await readGlobalConfig();
    const notionConfigured = config.notion?.apiKey || process.env.NOTION_API_KEY;
    checks.push({
      name: 'Notion integration',
      passed: !!notionConfigured,
      message: notionConfigured ? 'Configured' : 'Not configured (optional)',
      fix: 'Set NOTION_API_KEY in .env file',
      optional: true
    });
  }
  
  // Check Cursor rules
  const cursorRulesDir = path.join(process.cwd(), '.cursor', 'rules');
  const hasCursorRules = await fs.pathExists(cursorRulesDir);
  checks.push({
    name: 'Cursor AI rules',
    passed: hasCursorRules,
    message: hasCursorRules ? 'Found .cursor/rules/' : 'Not found',
    fix: 'Cursor rules help AI understand your research workflow'
  });
  
  // Display results
  console.log(chalk.white('Check Results:\n'));
  
  let allPassed = true;
  let requiredPassed = true;
  
  for (const check of checks) {
    const icon = check.passed ? chalk.green('✓') : (check.optional ? chalk.yellow('○') : chalk.red('✗'));
    const status = check.passed 
      ? chalk.green(check.message) 
      : (check.optional ? chalk.yellow(check.message) : chalk.red(check.message));
    
    console.log(`  ${icon} ${chalk.white(check.name)}: ${status}`);
    
    if (!check.passed) {
      allPassed = false;
      if (!check.optional) {
        requiredPassed = false;
      }
    }
  }
  
  console.log('');
  
  // Show fixes for failed checks
  const failedRequired = checks.filter(c => !c.passed && !c.optional);
  const failedOptional = checks.filter(c => !c.passed && c.optional);
  
  if (failedRequired.length > 0) {
    console.log(chalk.red('Required fixes:\n'));
    for (const check of failedRequired) {
      console.log(`  ${chalk.white(check.name)}:`);
      console.log(`    ${chalk.dim(check.fix)}\n`);
    }
  }
  
  if (failedOptional.length > 0) {
    console.log(chalk.yellow('Optional improvements:\n'));
    for (const check of failedOptional) {
      console.log(`  ${chalk.white(check.name)}:`);
      console.log(`    ${chalk.dim(check.fix)}\n`);
    }
  }
  
  // Summary
  if (requiredPassed) {
    console.log(chalk.green('✅ All required checks passed! SuperResearcher is ready.\n'));
    
    if (projects.length === 0) {
      console.log(chalk.cyan('Get started:'));
      console.log(chalk.white('  superresearcher init "My First Study"\n'));
    } else {
      console.log(chalk.cyan('Your projects:'));
      for (const project of projects) {
        console.log(chalk.white(`  • ${project}`));
      }
      console.log('');
    }
  } else {
    console.log(chalk.red('❌ Some required checks failed. Please fix the issues above.\n'));
    process.exit(1);
  }
}
