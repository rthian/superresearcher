/**
 * Notion API Integration for SuperResearcher
 * 
 * Handles syncing insights, actions, and personas with Notion databases.
 */

export class NotionClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.notion.com/v1';
    this.version = '2022-06-28';
  }

  async request(endpoint, method = 'GET', body = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Notion-Version': this.version,
        'Content-Type': 'application/json'
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Notion API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Query a database
   */
  async queryDatabase(databaseId, filter = null, sorts = null) {
    const body = {};
    if (filter) body.filter = filter;
    if (sorts) body.sorts = sorts;

    const result = await this.request(`/databases/${databaseId}/query`, 'POST', body);
    return result.results;
  }

  /**
   * Create a page (row) in a database
   */
  async createPage(databaseId, properties) {
    return this.request('/pages', 'POST', {
      parent: { database_id: databaseId },
      properties
    });
  }

  /**
   * Update a page
   */
  async updatePage(pageId, properties) {
    return this.request(`/pages/${pageId}`, 'PATCH', { properties });
  }

  /**
   * Query insights from Notion database
   */
  async queryInsights(databaseId, projectSlug) {
    const filter = projectSlug ? {
      property: 'Source Studies',
      relation: {
        contains: projectSlug
      }
    } : undefined;

    const results = await this.queryDatabase(databaseId, filter);
    return results.map(this.parseInsightFromNotion);
  }

  /**
   * Create or update an insight in Notion
   */
  async createOrUpdateInsight(databaseId, insight, projectSlug) {
    // Check if insight exists by ID
    let existingPage = null;
    
    if (insight.notionPageId) {
      try {
        existingPage = await this.request(`/pages/${insight.notionPageId}`);
      } catch {
        // Page doesn't exist, will create new
      }
    }

    const properties = this.formatInsightForNotion(insight);

    if (existingPage) {
      return this.updatePage(insight.notionPageId, properties);
    } else {
      return this.createPage(databaseId, properties);
    }
  }

  /**
   * Query actions from Notion database
   */
  async queryActions(databaseId, projectSlug) {
    const filter = projectSlug ? {
      property: 'Related Study',
      relation: {
        contains: projectSlug
      }
    } : undefined;

    const results = await this.queryDatabase(databaseId, filter);
    return results.map(this.parseActionFromNotion);
  }

  /**
   * Create or update an action in Notion
   */
  async createOrUpdateAction(databaseId, action, projectSlug) {
    let existingPage = null;
    
    if (action.notionPageId) {
      try {
        existingPage = await this.request(`/pages/${action.notionPageId}`);
      } catch {
        // Page doesn't exist
      }
    }

    const properties = this.formatActionForNotion(action);

    if (existingPage) {
      return this.updatePage(action.notionPageId, properties);
    } else {
      return this.createPage(databaseId, properties);
    }
  }

  /**
   * Format insight for Notion properties
   */
  formatInsightForNotion(insight) {
    const properties = {
      'Insight Title': {
        title: [{ text: { content: insight.title || '' } }]
      }
    };

    if (insight.category) {
      properties['Insight Category'] = {
        select: { name: insight.category }
      };
    }

    if (insight.impactLevel) {
      properties['Impact Level'] = {
        select: { name: `🔥 ${insight.impactLevel}` }
      };
    }

    if (insight.confidenceLevel) {
      properties['Confidence Level'] = {
        select: { name: `✅ ${insight.confidenceLevel}` }
      };
    }

    if (insight.evidence) {
      properties['Supporting Evidence'] = {
        rich_text: [{ text: { content: insight.evidence.substring(0, 2000) } }]
      };
    }

    if (insight.recommendedActions) {
      properties['Recommended Actions'] = {
        rich_text: [{ text: { content: insight.recommendedActions.substring(0, 2000) } }]
      };
    }

    if (insight.productArea) {
      properties['Product Area'] = {
        multi_select: Array.isArray(insight.productArea) 
          ? insight.productArea.map(a => ({ name: a }))
          : [{ name: insight.productArea }]
      };
    }

    if (insight.customerSegment) {
      properties['Customer Segment'] = {
        multi_select: Array.isArray(insight.customerSegment)
          ? insight.customerSegment.map(s => ({ name: s }))
          : [{ name: insight.customerSegment }]
      };
    }

    if (insight.status) {
      const statusMap = {
        'New': '🆕 New',
        'Under Review': '👀 Under Review',
        'In Progress': '🔄 In Progress',
        'Implemented': '✅ Implemented',
        'Rejected': '❌ Rejected'
      };
      properties['Status'] = {
        status: { name: statusMap[insight.status] || insight.status }
      };
    }

    if (insight.priority) {
      const priorityMap = {
        'Critical': '🚨 Critical',
        'High': '🔥 High',
        'Medium': '🟡 Medium',
        'Low': '🟢 Low'
      };
      properties['Priority'] = {
        status: { name: priorityMap[insight.priority] || insight.priority }
      };
    }

    return properties;
  }

  /**
   * Parse insight from Notion page
   */
  parseInsightFromNotion(page) {
    const props = page.properties;
    
    const getText = (prop) => {
      if (!prop) return null;
      if (prop.title) return prop.title[0]?.text?.content;
      if (prop.rich_text) return prop.rich_text[0]?.text?.content;
      return null;
    };

    const getSelect = (prop) => {
      if (!prop?.select) return null;
      return prop.select.name?.replace(/^[🔥✅🆕👀🔄❌🚨🟡🟢]\s*/, '');
    };

    const getMultiSelect = (prop) => {
      if (!prop?.multi_select) return [];
      return prop.multi_select.map(s => s.name);
    };

    return {
      notionPageId: page.id,
      title: getText(props['Insight Title']),
      category: getSelect(props['Insight Category']),
      impactLevel: getSelect(props['Impact Level']),
      confidenceLevel: getSelect(props['Confidence Level']),
      evidence: getText(props['Supporting Evidence']),
      recommendedActions: getText(props['Recommended Actions']),
      productArea: getMultiSelect(props['Product Area']),
      customerSegment: getMultiSelect(props['Customer Segment']),
      status: getSelect(props['Status']),
      priority: getSelect(props['Priority'])
    };
  }

  /**
   * Format action for Notion properties
   */
  formatActionForNotion(action) {
    const properties = {
      'Action Item': {
        title: [{ text: { content: action.title || '' } }]
      }
    };

    if (action.description) {
      properties['Description'] = {
        rich_text: [{ text: { content: action.description.substring(0, 2000) } }]
      };
    }

    if (action.priority) {
      const priorityMap = {
        'Critical': '🚨 Critical',
        'High': '🔴 High',
        'Medium': '🟡 Medium',
        'Low': '🟢 Low'
      };
      properties['Priority'] = {
        select: { name: priorityMap[action.priority] || action.priority }
      };
    }

    if (action.department) {
      properties['Department'] = {
        select: { name: action.department }
      };
    }

    if (action.status) {
      const statusMap = {
        'Not Started': '📋 Not Started',
        'In Progress': '🔄 In Progress',
        'Blocked': '🚫 Blocked',
        'Complete': '✅ Complete',
        'Cancelled': '❌ Cancelled'
      };
      properties['Status'] = {
        status: { name: statusMap[action.status] || action.status }
      };
    }

    if (action.effort) {
      properties['Effort Level'] = {
        select: { name: action.effort }
      };
    }

    if (action.impact) {
      properties['Expected Impact'] = {
        select: { name: action.impact }
      };
    }

    if (action.successMetrics) {
      properties['Success Metrics'] = {
        rich_text: [{ text: { content: action.successMetrics.substring(0, 2000) } }]
      };
    }

    if (action.dueDate) {
      properties['Due Date'] = {
        date: { start: action.dueDate }
      };
    }

    return properties;
  }

  /**
   * Parse action from Notion page
   */
  parseActionFromNotion(page) {
    const props = page.properties;
    
    const getText = (prop) => {
      if (!prop) return null;
      if (prop.title) return prop.title[0]?.text?.content;
      if (prop.rich_text) return prop.rich_text[0]?.text?.content;
      return null;
    };

    const getSelect = (prop) => {
      if (!prop?.select) return null;
      return prop.select.name?.replace(/^[🚨🔴🟡🟢📋🔄🚫✅❌]\s*/, '');
    };

    const getDate = (prop) => {
      if (!prop?.date) return null;
      return prop.date.start;
    };

    return {
      notionPageId: page.id,
      title: getText(props['Action Item']),
      description: getText(props['Description']),
      priority: getSelect(props['Priority']),
      department: getSelect(props['Department']),
      status: getSelect(props['Status']),
      effort: getSelect(props['Effort Level']),
      impact: getSelect(props['Expected Impact']),
      successMetrics: getText(props['Success Metrics']),
      dueDate: getDate(props['Due Date'])
    };
  }
}
