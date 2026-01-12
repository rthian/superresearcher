import fs from 'fs-extra';
import path from 'path';
import { getProjectDir } from './files.js';

/**
 * Write a prompt file for Cursor Agent
 */
export async function writePrompt(projectName, promptType, content) {
  const projectDir = getProjectDir(projectName);
  const promptsDir = path.join(projectDir, '.prompts');
  await fs.ensureDir(promptsDir);
  
  const promptPath = path.join(promptsDir, `${promptType}.md`);
  await fs.writeFile(promptPath, content);
  
  return promptPath;
}

/**
 * Generate extraction prompt
 */
export function generateExtractionPrompt(studyMetadata, methodology, transcripts, surveys) {
  return `# Customer Insights Extraction

You are analyzing research data to extract atomic, actionable customer insights.

## Study Context

${studyMetadata || 'No study metadata provided.'}

## Methodology

${methodology || 'No methodology details provided.'}

## Research Data

### Interview Transcripts
${transcripts.length > 0 
  ? transcripts.map(t => `#### ${t.filename}\n\`\`\`\n${t.content}\n\`\`\``).join('\n\n')
  : 'No transcripts available.'}

### Survey Data
${surveys.length > 0 
  ? surveys.map(s => `#### ${s.filename} (${s.type})\n\`\`\`${s.type}\n${typeof s.data === 'string' ? s.data : JSON.stringify(s.data, null, 2)}\n\`\`\``).join('\n\n')
  : 'No survey data available.'}

---

## Your Task

Extract customer insights following these principles:

### 1. Atomic Insights
- One insight = one idea
- Each insight should be independently actionable
- Avoid bundling multiple observations

### 2. Evidence-Based
- Every insight must cite supporting evidence
- Include verbatim quotes when available
- Note the source (transcript filename, survey question)

### 3. Categorization
Classify each insight into one of these categories:
- **Pain Point** - Frustrations and problems
- **Opportunity** - Potential improvements
- **Behavior** - How users actually behave
- **Preference** - What users prefer or like
- **Unmet Need** - Gaps in current experience
- **Bug Report** - Technical issues mentioned
- **Positive Feedback** - What's working well

### 4. Assessment
For each insight, rate:
- **Impact Level:** High / Medium / Low
- **Confidence Level:** High / Medium / Low (based on evidence strength)

### 5. Actionability
For each insight, suggest 1-2 concrete recommended actions.

---

## Output Format

Generate your insights in the following JSON structure. Write the output to \`insights/insights.json\`:

\`\`\`json
{
  "extractedAt": "ISO timestamp",
  "studyId": "project-slug",
  "totalInsights": number,
  "insights": [
    {
      "id": "unique-id",
      "title": "Short, specific insight statement",
      "category": "Pain Point | Opportunity | Behavior | etc.",
      "impactLevel": "High | Medium | Low",
      "confidenceLevel": "High | Medium | Low",
      "evidence": "Verbatim quote or observation with source",
      "source": "transcript/survey filename",
      "recommendedActions": "1-2 concrete suggestions",
      "productArea": "Onboarding | Core Features | Billing | etc.",
      "customerSegment": "Enterprise | Mid-Market | etc.",
      "tags": ["relevant", "theme", "tags"]
    }
  ]
}
\`\`\`

Also generate a human-readable markdown version at \`insights/insights.md\`.

Begin your analysis now.`;
}

/**
 * Generate review prompt
 */
export function generateReviewPrompt(studyMetadata, insights, focusArea) {
  const focusInstructions = {
    completeness: `
### Focus: Completeness
- Are there gaps in the research coverage?
- Which customer segments are underrepresented?
- What product areas lack insights?
- Are there missing edge cases or scenarios?`,
    accuracy: `
### Focus: Accuracy
- Is the evidence strong enough to support each insight?
- Are there any insights that seem contradictory?
- Which insights have low confidence and need validation?
- Are the categorizations correct?`,
    actionability: `
### Focus: Actionability
- Are the recommended actions specific enough?
- Which insights are most actionable right now?
- Are there insights without clear next steps?
- What's blocking action on high-impact insights?`,
    coverage: `
### Focus: Coverage
- How well do insights cover the business objectives?
- Are all personas represented?
- Which user journey stages need more research?
- What questions remain unanswered?`
  };

  return `# Insights Quality Review

You are reviewing extracted customer insights for quality and completeness.

## Study Context

${studyMetadata || 'No study metadata provided.'}

## Current Insights

\`\`\`json
${JSON.stringify(insights, null, 2)}
\`\`\`

---

## Review Framework

${focusArea && focusInstructions[focusArea] ? focusInstructions[focusArea] : `
Evaluate the insights across all dimensions:

### Completeness
- Research coverage gaps
- Underrepresented segments
- Missing scenarios

### Accuracy
- Evidence strength
- Contradictions
- Confidence calibration

### Actionability
- Specificity of recommendations
- Blocked insights
- Quick wins

### Coverage
- Business objective alignment
- Persona representation
- Journey stage coverage`}

---

## Output Format

Generate your review at \`insights/review.md\` with this structure:

\`\`\`markdown
# Insights Quality Review

**Study:** [Study Name]
**Review Date:** [Date]
**Focus Area:** [If specified]

## Executive Summary
[2-3 paragraph overview of insight quality]

## Strengths
- [What's working well]

## Gaps & Blind Spots
- [What's missing]

## Quality Issues
- [Insights needing revision]

## Recommendations
1. [Prioritized improvement suggestions]

## Next Research Priorities
- [What to investigate next]

## Insight-Level Feedback
| Insight ID | Issue | Suggestion |
|------------|-------|------------|
| ... | ... | ... |
\`\`\`

Begin your review now.`;
}

/**
 * Generate action items prompt
 */
export function generateActionPrompt(studyMetadata, insights, options = {}) {
  const priorityFilter = options.priority ? `\n**Filter:** Only ${options.priority} priority insights` : '';
  const deptFilter = options.department ? `\n**Focus Department:** ${options.department}` : '';

  return `# Action Item Generation

You are converting high-impact customer insights into concrete action items.

## Study Context

${studyMetadata || 'No study metadata provided.'}
${priorityFilter}
${deptFilter}

## Insights to Process

\`\`\`json
${JSON.stringify(insights, null, 2)}
\`\`\`

---

## Action Item Principles

### 1. Clarity
- Action titles must be verb-oriented ("Implement...", "Research...", "Fix...")
- Descriptions should pass the "5W1H" test
- Success metrics must be specific and measurable

### 2. Traceability
- Every action must link to its source insight
- Include relevant context from the insight

### 3. Scoping
Estimate effort level:
- **Small** (< 1 week)
- **Medium** (1-4 weeks)  
- **Large** (1+ months)

### 4. Department Assignment
Assign to the most appropriate team:
- Executive
- Product
- Engineering
- Design
- Research
- Marketing
- Sales
- Support

### 5. Prioritization
Consider:
- Insight impact level
- Customer segment affected
- Effort required
- Dependencies

---

## Output Format

Generate action items at \`actions/actions.json\`:

\`\`\`json
{
  "generatedAt": "ISO timestamp",
  "studyId": "project-slug",
  "totalActions": number,
  "actions": [
    {
      "id": "unique-id",
      "title": "Verb-oriented action title",
      "description": "Detailed explanation of what needs to be done",
      "priority": "Critical | High | Medium | Low",
      "department": "Product | Engineering | Design | etc.",
      "effort": "Small | Medium | Large",
      "impact": "High | Medium | Low",
      "successMetrics": "How to measure completion and impact",
      "sourceInsight": "insight-id",
      "sourceInsightTitle": "Original insight title",
      "status": "Not Started",
      "dueDate": null,
      "owner": null
    }
  ]
}
\`\`\`

Also generate \`actions/actions.md\` with human-readable format.

Begin generating action items now.`;
}

/**
 * Generate persona update prompt
 */
export function generatePersonaPrompt(studyMetadata, insights, existingPersonas, options = {}) {
  const modeInstructions = options.create
    ? `
### Mode: Create New Persona
Based on the insights, identify if a new persona archetype is emerging that isn't represented by existing personas. Create a comprehensive new persona profile.`
    : options.validate
    ? `
### Mode: Validate Existing Personas
Check if the new insights support or contradict existing persona definitions. Flag any personas that may need significant revision.`
    : `
### Mode: Update Personas
Update existing personas with new behavioral data, goals, and pain points discovered in this research.`;

  return `# Persona Analysis & Update

You are analyzing customer insights to update or create persona definitions.

## Study Context

${studyMetadata || 'No study metadata provided.'}

## New Insights

\`\`\`json
${JSON.stringify(insights, null, 2)}
\`\`\`

## Existing Personas

\`\`\`json
${JSON.stringify(existingPersonas, null, 2)}
\`\`\`

---
${modeInstructions}

## Persona Schema

Each persona should include:

### Identity
- **Name:** Archetype label
- **Type:** Primary / Secondary / Negative

### Demographics
- Age Range
- Life Stage
- Education Level
- Income Level
- Geographic Region
- Market Segment

### Behavioral Attributes
- Behaviors & Preferences
- Goals & Motivations
- Pain Points & Challenges

### Psychographics
- Decision Making Style
- Tech Comfort Level
- Device Usage
- Communication Preference

### Evidence
- Supporting Insights (list of insight IDs)
- Confidence Score (based on evidence strength)
- Last Updated

---

## Output Format

Generate persona updates at \`personas/updates.json\`:

\`\`\`json
{
  "updatedAt": "ISO timestamp",
  "studyId": "project-slug",
  "updates": [
    {
      "personaId": "existing-id or new",
      "action": "update | create | flag-for-review",
      "changes": {
        "field": "new value"
      },
      "newInsights": ["insight-id-1", "insight-id-2"],
      "rationale": "Why this change is suggested"
    }
  ],
  "newPersonas": [
    {
      // Full persona object if creating new
    }
  ],
  "validationFlags": [
    {
      "personaId": "id",
      "issue": "Description of concern",
      "conflictingInsights": ["insight-ids"]
    }
  ]
}
\`\`\`

Also generate \`personas/updates.md\` with human-readable summary.

Begin your persona analysis now.`;
}

/**
 * Generate audit prompt
 */
export function generateAuditPrompt(allInsights, allPersonas, allActions) {
  return `# Research Data Quality Audit

You are performing a comprehensive quality audit of the research repository.

## All Insights

\`\`\`json
${JSON.stringify(allInsights, null, 2)}
\`\`\`

## All Personas

\`\`\`json
${JSON.stringify(allPersonas, null, 2)}
\`\`\`

## All Actions

\`\`\`json
${JSON.stringify(allActions, null, 2)}
\`\`\`

---

## Audit Checks

### 1. Data Integrity
- [ ] All insights have source studies
- [ ] All actions have source insights
- [ ] All persona updates have supporting insights
- [ ] No orphaned records

### 2. Completeness
- [ ] Insights have required fields (title, category, evidence)
- [ ] Actions have required fields (title, description, priority)
- [ ] Personas have core attributes defined

### 3. Consistency
- [ ] Categories and tags are used consistently
- [ ] Priority levels align with impact assessments
- [ ] Confidence levels match evidence strength

### 4. Freshness
- [ ] Personas updated in last 90 days
- [ ] No stale action items (>30 days without update)
- [ ] Recent insights processed into personas

### 5. Coverage
- [ ] All customer segments represented
- [ ] All product areas covered
- [ ] Balanced insight categories

---

## Output Format

Generate audit report at \`audit-report.md\`:

\`\`\`markdown
# Research Repository Audit Report

**Audit Date:** [Date]
**Data Scope:** [Number of studies, insights, etc.]

## Summary Score
- Data Integrity: X/10
- Completeness: X/10
- Consistency: X/10
- Freshness: X/10
- Coverage: X/10
- **Overall: X/10**

## Critical Issues
[Issues requiring immediate attention]

## Warnings
[Issues to address soon]

## Recommendations
[Improvement suggestions]

## Detailed Findings

### Unlinked Records
| Type | ID | Issue |
|------|-----|-------|

### Incomplete Records
| Type | ID | Missing Fields |
|------|-----|----------------|

### Stale Records
| Type | ID | Last Updated |
|------|-----|--------------|

### Coverage Gaps
| Dimension | Gap |
|-----------|-----|
\`\`\`

Begin your audit now.`;
}

/**
 * Generate cross-study analysis prompt
 */
export function generateAnalysisPrompt(allStudies, allInsights, options = {}) {
  const analysisType = [];
  if (options.themes) analysisType.push('theme identification');
  if (options.patterns) analysisType.push('behavioral pattern detection');
  if (options.gaps) analysisType.push('research gap analysis');
  
  const analysisInstructions = analysisType.length > 0 
    ? `Focus on: ${analysisType.join(', ')}`
    : 'Perform comprehensive cross-study analysis';

  return `# Cross-Study Analysis

You are analyzing insights across multiple research studies to identify patterns and gaps.

## Analysis Scope
${analysisInstructions}

## All Studies

\`\`\`json
${JSON.stringify(allStudies, null, 2)}
\`\`\`

## All Insights

\`\`\`json
${JSON.stringify(allInsights, null, 2)}
\`\`\`

---

## Analysis Framework

### Theme Identification
- What recurring themes appear across studies?
- Which themes have the strongest evidence (multiple sources)?
- Are there emerging themes that warrant dedicated research?

### Behavioral Patterns
- What consistent behaviors appear across segments?
- Are there segment-specific patterns?
- How do behaviors differ by persona type?

### Research Gaps
- Which product areas lack recent research?
- Which customer segments are understudied?
- What questions appear repeatedly but aren't answered?

### Insight Synthesis
- Which insights from different studies support each other?
- Are there contradictory findings that need resolution?
- What meta-insights emerge from combining studies?

---

## Output Format

Generate analysis at \`shared/analysis/cross-study-analysis.md\`:

\`\`\`markdown
# Cross-Study Analysis Report

**Analysis Date:** [Date]
**Studies Analyzed:** [Count]
**Total Insights:** [Count]

## Executive Summary
[Key findings in 2-3 paragraphs]

## Themes

### Theme 1: [Name]
**Strength:** Strong/Medium/Weak
**Sources:** [List of studies]
**Key Insights:**
- [Related insights]

### Theme 2: [Name]
...

## Behavioral Patterns

### Pattern 1: [Name]
**Segments:** [Affected segments]
**Evidence:** [Supporting insights]

...

## Research Gaps

| Gap Area | Priority | Suggested Research |
|----------|----------|-------------------|

## Contradictions to Resolve

| Insight A | Insight B | Conflict | Resolution Approach |
|-----------|-----------|----------|---------------------|

## Recommendations

1. [Prioritized next steps]
\`\`\`

Also generate \`shared/themes/themes.json\` and \`shared/patterns/patterns.json\`.

Begin your cross-study analysis now.`;
}
