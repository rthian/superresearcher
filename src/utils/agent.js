import { spawn } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';

/**
 * Check if Cursor CLI (agent) is available
 */
export async function isAgentAvailable() {
  return new Promise((resolve) => {
    const proc = spawn('agent', ['--version'], { 
      shell: true,
      stdio: 'pipe' 
    });
    
    proc.on('close', (code) => {
      resolve(code === 0);
    });
    
    proc.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Run a prompt with Cursor Agent
 */
export async function runWithAgent(promptPath, projectDir) {
  const spinner = ora('Starting Cursor Agent...').start();
  
  return new Promise((resolve, reject) => {
    const proc = spawn('agent', ['run', promptPath], {
      cwd: projectDir,
      shell: true,
      stdio: 'inherit'
    });
    
    spinner.stop();
    console.log(chalk.cyan('\n🤖 Cursor Agent is processing...\n'));
    
    proc.on('close', (code) => {
      if (code === 0) {
        console.log(chalk.green('\n✅ Agent completed successfully'));
        resolve();
      } else {
        reject(new Error(`Agent exited with code ${code}`));
      }
    });
    
    proc.on('error', (err) => {
      spinner.stop();
      reject(err);
    });
  });
}

/**
 * Display manual instructions when agent isn't available
 */
export function displayManualInstructions(promptPath) {
  console.log(chalk.yellow('\n📋 Cursor Agent not available. Run manually:\n'));
  console.log(chalk.white('  1. Open Cursor'));
  console.log(chalk.white(`  2. Open the prompt file: ${chalk.cyan(promptPath)}`));
  console.log(chalk.white('  3. Select all content and run with Cursor AI (Cmd+K or Cmd+L)'));
  console.log(chalk.white('  4. Review and apply the generated outputs\n'));
  console.log(chalk.dim('Tip: Install Cursor CLI for automated execution:'));
  console.log(chalk.dim('  curl https://cursor.com/install -fsS | bash'));
  console.log(chalk.dim('  agent login\n'));
}
