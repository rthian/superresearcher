import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { v4 as uuidv4 } from 'uuid';
import { 
  getProjectDir, 
  slugify, 
  projectExists,
  ensureGlobalConfig 
} from '../utils/files.js';
import { STUDY_TYPES } from '../config/constants.js';
import { trackCommand } from '../utils/telemetry.js';

export async function initCommand(name, options) {
  const spinner = ora('Creating research project...').start();
  
  try {
    // Track command
    trackCommand('init', { studyType: options.type });
    
    // Validate study type
    if (!STUDY_TYPES.includes(options.type)) {
      spinner.fail(`Invalid study type: ${options.type}`);
      console.log(chalk.yellow(`Valid types: ${STUDY_TYPES.join(', ')}`));
      process.exit(1);
    }
    
    // Check if project already exists
    if (await projectExists(name)) {
      spinner.fail(`Project "${name}" already exists`);
      process.exit(1);
    }
    
    // Ensure global config exists
    await ensureGlobalConfig();
    
    const projectDir = getProjectDir(name);
    const slug = slugify(name);
    const studyId = uuidv4();
    
    // Create directory structure
    const directories = [
      'context/transcripts',
      'context/reports',
      'context/surveys',
      'insights',
      'personas',
      'actions',
      '.prompts'
    ];
    
    for (const dir of directories) {
      await fs.ensureDir(path.join(projectDir, dir));
    }
    
    // Create study.config.json
    const config = {
      id: studyId,
      name,
      slug,
      type: options.type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Planning',
      notion: {
        enabled: options.notion || false,
        studyPageId: null,
        insightsDatabaseId: null
      },
      metadata: {
        participants: 0,
        startDate: null,
        endDate: null,
        owner: null
      }
    };
    
    await fs.writeJson(path.join(projectDir, 'study.config.json'), config, { spaces: 2 });
    
    // Create study.md template
    const studyTemplate = `# ${name}

**Study ID:** ${studyId}
**Type:** ${formatStudyType(options.type)}
**Status:** 📋 Planning
**Created:** ${new Date().toLocaleDateString()}

---

## Business Objective

<!-- Why is this research being conducted? What decisions will it inform? -->

[Describe the business objective here]

---

## Research Questions

<!-- What specific questions are you trying to answer? -->

1. [Research question 1]
2. [Research question 2]
3. [Research question 3]

---

## Target Participants

<!-- Who are you researching? -->

- **Segment:** [e.g., Enterprise customers, Free trial users]
- **Criteria:** [e.g., Used product for 30+ days, Made a purchase]
- **Target Count:** [Number of participants]

---

## Key Findings

<!-- Summary of main discoveries (fill in after research) -->

[To be completed after analysis]

---

## Timeline

- **Start Date:** [TBD]
- **End Date:** [TBD]
- **Analysis Complete:** [TBD]

---

## Team

- **Research Owner:** [Name]
- **Stakeholders:** [Names/Teams]
`;

    await fs.writeFile(path.join(projectDir, 'context', 'study.md'), studyTemplate);
    
    // Create methodology.md template
    const methodologyTemplate = `# Research Methodology

## Study Type: ${formatStudyType(options.type)}

---

## Methods Used

<!-- Check all that apply -->

- [ ] User Interviews
- [ ] Usability Testing
- [ ] Surveys
- [ ] Card Sorting
- [ ] Focus Groups
- [ ] Contextual Inquiry
- [ ] A/B Testing
- [ ] Diary Studies
- [ ] Heatmap Analysis

---

## Interview Guide / Test Script

<!-- Add your discussion guide or test script here -->

### Introduction
[Script for introducing the session]

### Core Questions
1. [Question 1]
2. [Question 2]
3. [Question 3]

### Follow-up Probes
- [Probe 1]
- [Probe 2]

### Wrap-up
[Script for closing the session]

---

## Participant Recruitment

- **Source:** [e.g., Customer database, UserTesting.com]
- **Screening Criteria:** [List criteria]
- **Incentive:** [e.g., $50 gift card]

---

## Data Collection

- **Recording:** [Yes/No, consent obtained]
- **Transcription:** [Manual/Automated service]
- **Note-taking:** [Method]

---

## Analysis Approach

- [ ] Thematic Analysis
- [ ] Affinity Mapping
- [ ] Quantitative Analysis
- [ ] Journey Mapping
- [ ] Other: [Specify]
`;

    await fs.writeFile(path.join(projectDir, 'context', 'methodology.md'), methodologyTemplate);
    
    // Create placeholder files
    await fs.writeFile(
      path.join(projectDir, 'context', 'transcripts', '.gitkeep'),
      '# Place interview transcripts here (.md or .txt files)\n'
    );
    
    await fs.writeFile(
      path.join(projectDir, 'context', 'reports', '.gitkeep'),
      '# Place PDF research reports here\n'
    );
    
    await fs.writeFile(
      path.join(projectDir, 'context', 'surveys', '.gitkeep'),
      '# Place survey data here (.csv or .json files)\n'
    );
    
    // Create empty insights.json
    await fs.writeJson(
      path.join(projectDir, 'insights', 'insights.json'),
      { insights: [], extractedAt: null, studyId: slug },
      { spaces: 2 }
    );
    
    // Create empty actions.json
    await fs.writeJson(
      path.join(projectDir, 'actions', 'actions.json'),
      { actions: [], generatedAt: null, studyId: slug },
      { spaces: 2 }
    );
    
    spinner.succeed(`Created project: ${chalk.cyan(name)}`);
    
    console.log(chalk.dim(`\nProject directory: ${projectDir}\n`));
    console.log(chalk.white('Next steps:'));
    console.log(chalk.white(`  1. Edit ${chalk.cyan('context/study.md')} with your research objectives`));
    console.log(chalk.white(`  2. Add interview transcripts to ${chalk.cyan('context/transcripts/')}`));
    console.log(chalk.white(`  3. Add survey data to ${chalk.cyan('context/surveys/')}`));
    console.log(chalk.white(`  4. Run ${chalk.cyan(`superresearcher extract ${slug}`)} to extract insights\n`));
    
    if (options.notion) {
      console.log(chalk.yellow('📝 Notion sync enabled. Configure your API key in .env'));
    }
    
  } catch (error) {
    spinner.fail('Failed to create project');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

function formatStudyType(type) {
  const formats = {
    'interview': 'User Interview',
    'survey': 'Survey',
    'usability': 'Usability Test',
    'focus-group': 'Focus Group',
    'observational': 'Observational Study',
    'diary-study': 'Diary Study',
    'card-sort': 'Card Sort',
    'a-b-test': 'A/B Test'
  };
  return formats[type] || type;
}
