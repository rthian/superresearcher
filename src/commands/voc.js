import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { parseChunkedVerbatims, generateVocJsonPrompt, parseAppStoreReviews, convertToChunkedFormat } from '../utils/voc.js';
import { isAgentAvailable, runWithAgent, displayManualInstructions } from '../utils/agent.js';
import { trackCommand } from '../utils/telemetry.js';

export async function vocChunkToJsonCommand(inputPath, options) {
  const spinner = ora('Processing VoC chunk...').start();
  
  try {
    // Track command
    if (options.telemetry !== false) {
      trackCommand('voc-chunk-to-json', { hasAgent: options.agent });
    }
    
    // Validate input file exists
    if (!await fs.pathExists(inputPath)) {
      spinner.fail(`File not found: ${inputPath}`);
      process.exit(1);
    }
    
    // Parse the chunked markdown
    spinner.text = 'Parsing chunked verbatims...';
    const chunkData = await parseChunkedVerbatims(inputPath);
    
    if (!chunkData || chunkData.verbatims.length === 0) {
      spinner.fail('No verbatims found in file');
      console.log(chalk.yellow('\nExpected format:'));
      console.log(chalk.white('  [1]'));
      console.log(chalk.white('  Rating: 2'));
      console.log(chalk.white('  Verbatim: App crashes after login...'));
      console.log(chalk.yellow('\nMake sure your file follows the chunked format from the VoC pipeline documentation.'));
      process.exit(1);
    }
    
    spinner.text = 'Generating conversion prompt...';
    
    // Generate the prompt
    const prompt = generateVocJsonPrompt(chunkData);
    
    // Determine output paths
    const inputDir = path.dirname(inputPath);
    const inputBasename = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(inputDir, `${inputBasename}.json`);
    const promptPath = path.join(inputDir, `${inputBasename}_prompt.md`);
    
    // Write prompt file
    await fs.writeFile(promptPath, prompt);
    
    spinner.succeed('Conversion prompt ready');
    
    // Display summary
    console.log(chalk.dim('\nChunk summary:'));
    console.log(chalk.white(`  • Bank: ${chunkData.bank || 'Unknown'}`));
    console.log(chalk.white(`  • Quarter: ${chunkData.quarter || 'Unknown'}`));
    console.log(chalk.white(`  • Platform: ${chunkData.platform || 'Unknown'}`));
    console.log(chalk.white(`  • Chunk: ${chunkData.chunk || 'Unknown'}`));
    console.log(chalk.white(`  • Verbatims: ${chunkData.verbatims.length}`));
    console.log('');
    
    // Run with agent or show manual instructions
    if (options.agent) {
      const agentAvailable = await isAgentAvailable();
      
      if (agentAvailable) {
        console.log(chalk.cyan('Running conversion with Cursor Agent...\n'));
        await runWithAgent(promptPath, inputDir);
        
        console.log(chalk.green('\n✅ Conversion complete!'));
        console.log(chalk.white(`\nNext steps:`));
        console.log(chalk.white(`  1. Review generated JSON at ${chalk.cyan(outputPath)}`));
        console.log(chalk.white(`  2. Verify all verbatims were converted correctly\n`));
      } else {
        displayManualInstructions(promptPath);
      }
    } else {
      console.log(chalk.green(`✅ Prompt generated: ${chalk.cyan(promptPath)}\n`));
      console.log(chalk.white('To convert to JSON:'));
      console.log(chalk.white(`  1. Open ${chalk.cyan(promptPath)} in Cursor`));
      console.log(chalk.white('  2. Run with Cursor AI (Cmd+L → select all → submit)'));
      console.log(chalk.white(`  3. Copy the JSON output and save to ${chalk.cyan(outputPath)}\n`));
      console.log(chalk.dim(`Or run with --agent flag for automated conversion:`));
      console.log(chalk.dim(`  superresearcher voc chunk-to-json ${inputPath} --agent\n`));
    }
    
  } catch (error) {
    spinner.fail('VoC conversion failed');
    console.error(chalk.red(error.message));
    if (error.stack) {
      console.error(chalk.dim(error.stack));
    }
    process.exit(1);
  }
}

export async function vocConvertToChunksCommand(inputPath, options) {
  const spinner = ora('Converting app store reviews to chunks...').start();
  
  try {
    // Track command
    if (options.telemetry !== false) {
      trackCommand('voc-convert-to-chunks', { chunkSize: options.chunkSize });
    }
    
    // Validate input file exists
    if (!await fs.pathExists(inputPath)) {
      spinner.fail(`File not found: ${inputPath}`);
      process.exit(1);
    }
    
    // Parse the app store review file
    spinner.text = 'Parsing app store reviews...';
    const reviewData = await parseAppStoreReviews(inputPath);
    
    if (!reviewData || reviewData.verbatims.length === 0) {
      spinner.fail('No reviews found in file');
      console.log(chalk.yellow('\nExpected app store review format with:'));
      console.log(chalk.white('  ### Review - YYYY-MM-DD'));
      console.log(chalk.white('  **Rating:** ★☆☆☆☆'));
      console.log(chalk.white('  **Subject:** ...'));
      console.log(chalk.white('  > Review body...'));
      process.exit(1);
    }
    
    spinner.text = 'Converting to chunked format...';
    
    // Convert to chunks
    const chunkSize = parseInt(options.chunkSize, 10) || 20;
    const chunks = convertToChunkedFormat(reviewData, chunkSize);
    
    // Determine output directory
    const inputDir = path.dirname(inputPath);
    const inputBasename = path.basename(inputPath, path.extname(inputPath));
    const outputDir = path.join(inputDir, `${inputBasename}_chunks`);
    
    // Create output directory
    await fs.ensureDir(outputDir);
    
    // Write chunk files
    spinner.text = 'Writing chunk files...';
    for (const chunk of chunks) {
      const chunkFileName = `${inputBasename}_chunk_${chunk.chunkNumber}.md`;
      const chunkPath = path.join(outputDir, chunkFileName);
      await fs.writeFile(chunkPath, chunk.content);
    }
    
    spinner.succeed('Conversion complete!');
    
    // Display summary
    console.log(chalk.dim('\nConversion summary:'));
    console.log(chalk.white(`  • Bank: ${reviewData.bank || 'Unknown'}`));
    console.log(chalk.white(`  • Quarter: ${reviewData.quarter || 'Unknown'}`));
    console.log(chalk.white(`  • Platform: ${reviewData.platform || 'Unknown'}`));
    console.log(chalk.white(`  • Total reviews: ${reviewData.verbatims.length}`));
    console.log(chalk.white(`  • Chunk size: ${chunkSize} reviews per chunk`));
    console.log(chalk.white(`  • Total chunks: ${chunks.length}`));
    console.log(chalk.white(`  • Output directory: ${chalk.cyan(outputDir)}`));
    console.log('');
    
    console.log(chalk.green('✅ Chunk files created:'));
    chunks.forEach(chunk => {
      const chunkFileName = `${inputBasename}_chunk_${chunk.chunkNumber}.md`;
      console.log(chalk.white(`  • ${chunkFileName} (${chunk.verbatimCount} reviews)`));
    });
    
    console.log(chalk.dim(`\nNext step: Convert chunks to JSON:`));
    console.log(chalk.dim(`  superresearcher voc chunk-to-json ${outputDir}/${inputBasename}_chunk_01.md --agent\n`));
    
  } catch (error) {
    spinner.fail('Conversion failed');
    console.error(chalk.red(error.message));
    if (error.stack) {
      console.error(chalk.dim(error.stack));
    }
    process.exit(1);
  }
}

