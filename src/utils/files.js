import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

/**
 * Get the projects directory path
 */
export function getProjectsDir() {
  return path.join(process.cwd(), 'projects');
}

/**
 * Get the shared directory path
 */
export function getSharedDir() {
  return path.join(process.cwd(), 'shared');
}

/**
 * Convert project name to slug
 */
export function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get project directory path
 */
export function getProjectDir(projectName) {
  const slug = slugify(projectName);
  return path.join(getProjectsDir(), slug);
}

/**
 * Check if a project exists
 */
export async function projectExists(projectName) {
  const projectDir = getProjectDir(projectName);
  return fs.pathExists(projectDir);
}

/**
 * List all projects
 */
export async function listProjects() {
  const projectsDir = getProjectsDir();
  if (!await fs.pathExists(projectsDir)) {
    return [];
  }
  
  const entries = await fs.readdir(projectsDir, { withFileTypes: true });
  return entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
}

/**
 * Read project config
 */
export async function readProjectConfig(projectName) {
  const projectDir = getProjectDir(projectName);
  const configPath = path.join(projectDir, 'study.config.json');
  
  if (await fs.pathExists(configPath)) {
    return fs.readJson(configPath);
  }
  return null;
}

/**
 * Write project config
 */
export async function writeProjectConfig(projectName, config) {
  const projectDir = getProjectDir(projectName);
  const configPath = path.join(projectDir, 'study.config.json');
  await fs.writeJson(configPath, config, { spaces: 2 });
}

/**
 * Get all files matching pattern in project
 */
export async function getProjectFiles(projectName, pattern) {
  const projectDir = getProjectDir(projectName);
  const files = await glob(pattern, { cwd: projectDir });
  return files.map(f => path.join(projectDir, f));
}

/**
 * Read all transcripts from a project
 */
export async function readTranscripts(projectName) {
  const projectDir = getProjectDir(projectName);
  const transcriptsDir = path.join(projectDir, 'context', 'transcripts');
  
  if (!await fs.pathExists(transcriptsDir)) {
    return [];
  }

  const files = await fs.readdir(transcriptsDir);
  const transcripts = [];

  for (const file of files) {
    if (file.endsWith('.md') || file.endsWith('.txt')) {
      const content = await fs.readFile(path.join(transcriptsDir, file), 'utf-8');
      transcripts.push({ filename: file, content });
    }
  }

  return transcripts;
}

/**
 * Read all survey data from a project
 */
export async function readSurveys(projectName) {
  const projectDir = getProjectDir(projectName);
  const surveysDir = path.join(projectDir, 'context', 'surveys');
  
  if (!await fs.pathExists(surveysDir)) {
    return [];
  }

  const files = await fs.readdir(surveysDir);
  const surveys = [];

  for (const file of files) {
    const filePath = path.join(surveysDir, file);
    if (file.endsWith('.json')) {
      const content = await fs.readJson(filePath);
      surveys.push({ filename: file, type: 'json', data: content });
    } else if (file.endsWith('.csv')) {
      const content = await fs.readFile(filePath, 'utf-8');
      surveys.push({ filename: file, type: 'csv', data: content });
    }
  }

  return surveys;
}

/**
 * Read all PDF reports from a project
 */
export async function readReports(projectName) {
  const projectDir = getProjectDir(projectName);
  const reportsDir = path.join(projectDir, 'context', 'reports');
  
  if (!await fs.pathExists(reportsDir)) {
    return [];
  }

  const files = await fs.readdir(reportsDir);
  const reports = [];

  for (const file of files) {
    if (file.endsWith('.pdf')) {
      const filePath = path.join(reportsDir, file);
      try {
        const pdfParse = (await import('pdf-parse')).default;
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdfParse(dataBuffer);
        reports.push({ 
          filename: file, 
          type: 'pdf', 
          content: data.text,
          pages: data.numpages 
        });
      } catch (error) {
        console.error(`Error reading PDF ${file}:`, error.message);
      }
    }
  }

  return reports;
}

/**
 * Read study metadata
 */
export async function readStudyMetadata(projectName) {
  const projectDir = getProjectDir(projectName);
  const studyPath = path.join(projectDir, 'context', 'study.md');
  
  if (await fs.pathExists(studyPath)) {
    return fs.readFile(studyPath, 'utf-8');
  }
  return null;
}

/**
 * Read methodology
 */
export async function readMethodology(projectName) {
  const projectDir = getProjectDir(projectName);
  const methodPath = path.join(projectDir, 'context', 'methodology.md');
  
  if (await fs.pathExists(methodPath)) {
    return fs.readFile(methodPath, 'utf-8');
  }
  return null;
}

/**
 * Read existing insights
 */
export async function readInsights(projectName) {
  const projectDir = getProjectDir(projectName);
  const insightsPath = path.join(projectDir, 'insights', 'insights.json');
  
  if (await fs.pathExists(insightsPath)) {
    return fs.readJson(insightsPath);
  }
  return { insights: [] };
}

/**
 * Write insights
 */
export async function writeInsights(projectName, insights) {
  const projectDir = getProjectDir(projectName);
  const jsonPath = path.join(projectDir, 'insights', 'insights.json');
  const mdPath = path.join(projectDir, 'insights', 'insights.md');

  await fs.writeJson(jsonPath, insights, { spaces: 2 });
  await fs.writeFile(mdPath, formatInsightsMarkdown(insights));
}

/**
 * Format insights as markdown
 */
function formatInsightsMarkdown(data) {
  let md = `# Customer Insights\n\n`;
  md += `**Generated:** ${new Date().toISOString()}\n`;
  md += `**Total Insights:** ${data.insights.length}\n\n`;
  md += `---\n\n`;

  const byCategory = {};
  for (const insight of data.insights) {
    const cat = insight.category || 'Uncategorized';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(insight);
  }

  for (const [category, insights] of Object.entries(byCategory)) {
    md += `## ${category}\n\n`;
    for (const insight of insights) {
      const priority = insight.priority ? `[${insight.priority}]` : '';
      const impact = insight.impactLevel ? `Impact: ${insight.impactLevel}` : '';
      const confidence = insight.confidenceLevel ? `Confidence: ${insight.confidenceLevel}` : '';
      
      md += `### ${priority} ${insight.title}\n\n`;
      if (impact || confidence) {
        md += `*${[impact, confidence].filter(Boolean).join(' | ')}*\n\n`;
      }
      if (insight.evidence) {
        md += `**Evidence:**\n> ${insight.evidence}\n\n`;
      }
      if (insight.recommendedActions) {
        md += `**Recommended Actions:**\n${insight.recommendedActions}\n\n`;
      }
      md += `---\n\n`;
    }
  }

  return md;
}

/**
 * Read shared personas
 */
export async function readSharedPersonas() {
  const personasPath = path.join(getSharedDir(), 'personas', 'personas.json');
  
  if (await fs.pathExists(personasPath)) {
    return fs.readJson(personasPath);
  }
  return { personas: [] };
}

/**
 * Write shared personas
 */
export async function writeSharedPersonas(personas) {
  const sharedDir = getSharedDir();
  const jsonPath = path.join(sharedDir, 'personas', 'personas.json');
  const mdPath = path.join(sharedDir, 'personas', 'personas.md');

  await fs.ensureDir(path.dirname(jsonPath));
  await fs.writeJson(jsonPath, personas, { spaces: 2 });
  await fs.writeFile(mdPath, formatPersonasMarkdown(personas));
}

/**
 * Format personas as markdown
 */
function formatPersonasMarkdown(data) {
  let md = `# Customer Personas\n\n`;
  md += `**Last Updated:** ${new Date().toISOString()}\n`;
  md += `**Total Personas:** ${data.personas.length}\n\n`;
  md += `---\n\n`;

  for (const persona of data.personas) {
    const type = persona.type ? `(${persona.type})` : '';
    md += `## ${persona.name} ${type}\n\n`;
    
    if (persona.demographics) {
      md += `### Demographics\n`;
      for (const [key, value] of Object.entries(persona.demographics)) {
        md += `- **${key}:** ${value}\n`;
      }
      md += `\n`;
    }

    if (persona.behaviors) {
      md += `### Behaviors & Preferences\n${persona.behaviors}\n\n`;
    }

    if (persona.goals) {
      md += `### Goals & Motivations\n${persona.goals}\n\n`;
    }

    if (persona.painPoints) {
      md += `### Pain Points & Challenges\n${persona.painPoints}\n\n`;
    }

    if (persona.supportingInsights && persona.supportingInsights.length > 0) {
      md += `### Supporting Insights\n`;
      for (const insight of persona.supportingInsights) {
        md += `- ${insight}\n`;
      }
      md += `\n`;
    }

    md += `---\n\n`;
  }

  return md;
}

/**
 * Read action items
 */
export async function readActions(projectName) {
  const projectDir = getProjectDir(projectName);
  const actionsPath = path.join(projectDir, 'actions', 'actions.json');
  
  if (await fs.pathExists(actionsPath)) {
    return fs.readJson(actionsPath);
  }
  return { actions: [] };
}

/**
 * Write action items
 */
export async function writeActions(projectName, actions) {
  const projectDir = getProjectDir(projectName);
  const jsonPath = path.join(projectDir, 'actions', 'actions.json');
  const mdPath = path.join(projectDir, 'actions', 'actions.md');

  await fs.writeJson(jsonPath, actions, { spaces: 2 });
  await fs.writeFile(mdPath, formatActionsMarkdown(actions));
}

/**
 * Format actions as markdown
 */
function formatActionsMarkdown(data) {
  let md = `# Action Items\n\n`;
  md += `**Generated:** ${new Date().toISOString()}\n`;
  md += `**Total Actions:** ${data.actions.length}\n\n`;
  md += `---\n\n`;

  const byPriority = { Critical: [], High: [], Medium: [], Low: [] };
  for (const action of data.actions) {
    const priority = action.priority || 'Medium';
    if (!byPriority[priority]) byPriority[priority] = [];
    byPriority[priority].push(action);
  }

  for (const [priority, actions] of Object.entries(byPriority)) {
    if (actions.length === 0) continue;
    
    const emoji = { Critical: '🚨', High: '🔴', Medium: '🟡', Low: '🟢' }[priority] || '';
    md += `## ${emoji} ${priority} Priority\n\n`;
    
    for (const action of actions) {
      md += `### ${action.title}\n\n`;
      if (action.description) {
        md += `${action.description}\n\n`;
      }
      
      const meta = [];
      if (action.department) meta.push(`**Department:** ${action.department}`);
      if (action.effort) meta.push(`**Effort:** ${action.effort}`);
      if (action.impact) meta.push(`**Impact:** ${action.impact}`);
      if (meta.length > 0) {
        md += `${meta.join(' | ')}\n\n`;
      }
      
      if (action.successMetrics) {
        md += `**Success Metrics:**\n${action.successMetrics}\n\n`;
      }
      
      if (action.sourceInsight) {
        md += `**Source Insight:** ${action.sourceInsight}\n\n`;
      }
      
      md += `---\n\n`;
    }
  }

  return md;
}

/**
 * Ensure global config exists
 */
export async function ensureGlobalConfig() {
  const configDir = path.join(process.cwd(), '.superresearcher');
  const configPath = path.join(configDir, 'config.json');
  
  if (!await fs.pathExists(configPath)) {
    await fs.ensureDir(configDir);
    await fs.writeJson(configPath, {
      version: '1.0.0',
      telemetry: true,
      notion: {
        enabled: false,
        apiKey: null,
        databases: {}
      },
      defaults: {
        studyType: 'interview',
        outputFormat: 'both'
      }
    }, { spaces: 2 });
  }
  
  return fs.readJson(configPath);
}

/**
 * Read global config
 */
export async function readGlobalConfig() {
  return ensureGlobalConfig();
}

/**
 * Write global config
 */
export async function writeGlobalConfig(config) {
  const configPath = path.join(process.cwd(), '.superresearcher', 'config.json');
  await fs.writeJson(configPath, config, { spaces: 2 });
}
