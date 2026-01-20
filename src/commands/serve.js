import chalk from 'chalk';
import ora from 'ora';
import open from 'open';
import { startServer } from '../../server/index.js';
import { trackCommand } from '../utils/telemetry.js';

export async function serveCommand(options) {
  const spinner = ora('Starting SuperResearcher UI server...').start();
  
  try {
    // Track command
    if (options.telemetry !== false) {
      trackCommand('serve', { port: options.port });
    }
    
    const port = parseInt(options.port, 10) || 3000;
    
    // Start the server
    await startServer(port);
    
    spinner.succeed(chalk.green('SuperResearcher UI is running!'));
    
    console.log('');
    console.log(chalk.cyan('🚀 Server Information:'));
    console.log(chalk.white(`  Local:   http://localhost:${port}`));
    console.log('');
    console.log(chalk.dim('  Press Ctrl+C to stop the server'));
    console.log('');
    
    // Open browser automatically unless disabled
    if (options.browser !== false) {
      try {
        await open(`http://localhost:${port}`);
        console.log(chalk.green('✓ Opened in browser\n'));
      } catch (err) {
        console.log(chalk.yellow('⚠ Could not open browser automatically\n'));
      }
    }
    
    // Keep the process running
    process.on('SIGINT', () => {
      console.log('\n');
      console.log(chalk.yellow('Shutting down server...'));
      process.exit(0);
    });
    
  } catch (error) {
    spinner.fail('Failed to start server');
    
    if (error.code === 'EADDRINUSE') {
      console.error(chalk.red(`\nPort ${options.port || 3000} is already in use.`));
      console.log(chalk.yellow('\nTry using a different port:'));
      console.log(chalk.white(`  superresearcher serve --port 3001\n`));
    } else {
      console.error(chalk.red('\nError:', error.message));
    }
    
    process.exit(1);
  }
}

