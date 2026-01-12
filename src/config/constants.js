export const VERSION = '1.0.0';

export const STUDY_TYPES = [
  'interview',
  'survey', 
  'usability',
  'focus-group',
  'observational',
  'diary-study',
  'card-sort',
  'a-b-test'
];

export const INSIGHT_CATEGORIES = [
  'Pain Point',
  'Opportunity',
  'Behavior',
  'Preference',
  'Unmet Need',
  'Bug Report',
  'Positive Feedback'
];

export const IMPACT_LEVELS = ['High', 'Medium', 'Low'];
export const CONFIDENCE_LEVELS = ['High', 'Medium', 'Low'];

export const INSIGHT_STATUSES = [
  'New',
  'Under Review',
  'In Progress',
  'Implemented',
  'Rejected'
];

export const ACTION_STATUSES = [
  'Not Started',
  'In Progress',
  'Blocked',
  'Complete',
  'Cancelled'
];

export const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];

export const DEPARTMENTS = [
  'Executive',
  'Product',
  'Engineering',
  'Design',
  'Research',
  'Marketing',
  'Sales',
  'Support'
];

export const PRODUCT_AREAS = [
  'Onboarding',
  'Core Features',
  'Billing',
  'Support',
  'Integrations',
  'Mobile',
  'API',
  'Analytics'
];

export const CUSTOMER_SEGMENTS = [
  'Enterprise',
  'Mid-Market',
  'Small Business',
  'Individual',
  'Free Trial',
  'Paid User',
  'Churned User'
];

export const PERSONA_TYPES = ['Primary', 'Secondary', 'Negative'];

export const AGE_RANGES = [
  'Gen Z (18-26)',
  'Millennial (27-42)',
  'Gen X (43-58)',
  'Boomer (59+)'
];

export const MARKET_SEGMENTS = [
  'Enterprise (1000+)',
  'Mid-Market (100-999)',
  'Small Business (10-99)',
  'Individual/Freelancer'
];

export const TECH_COMFORT_LEVELS = [
  'Digital Native',
  'Tech-Comfortable',
  'Moderate User',
  'Tech-Hesitant'
];

export const DECISION_STYLES = [
  'Data-Driven',
  'Emotion-Led',
  'Social Proof',
  'Price-Focused',
  'Convenience-First'
];

export const PROJECT_STRUCTURE = {
  context: {
    'study.md': 'Research study metadata and objectives',
    'methodology.md': 'Research methods and approach',
    'transcripts/': 'Interview transcripts and notes',
    'reports/': 'PDF research reports',
    'surveys/': 'Survey data (CSV/JSON)'
  },
  insights: {
    'insights.md': 'Extracted customer insights',
    'insights.json': 'JSON format for Notion sync',
    'review.md': 'Quality review findings'
  },
  personas: {
    'updates.md': 'Persona updates from this study',
    'updates.json': 'JSON format for Notion sync'
  },
  actions: {
    'actions.md': 'Generated action items',
    'actions.json': 'JSON format for Notion sync'
  }
};

export const TELEMETRY_ENDPOINT = 'https://api.superresearcher.dev/telemetry';
