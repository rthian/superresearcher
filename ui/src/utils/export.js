/**
 * Export utilities for insights, actions, and reports
 */

/**
 * Export data to CSV format
 */
export function exportToCSV(data, filename, columns) {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Generate CSV header
  const headers = columns.map(col => col.label || col.key);
  const headerRow = headers.join(',');

  // Generate CSV rows
  const rows = data.map(item => {
    return columns.map(col => {
      let value = item[col.key];
      
      // Handle nested values
      if (col.accessor) {
        value = col.accessor(item);
      }
      
      // Escape commas and quotes
      if (typeof value === 'string') {
        value = value.replace(/"/g, '""');
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
          value = `"${value}"`;
        }
      }
      
      return value ?? '';
    }).join(',');
  });

  // Combine header and rows
  const csv = [headerRow, ...rows].join('\n');

  // Trigger download
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}

/**
 * Export data to JSON format
 */
export function exportToJSON(data, filename) {
  if (!data) {
    console.warn('No data to export');
    return;
  }

  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, 'application/json;charset=utf-8;');
}

/**
 * Export insights to CSV
 */
export function exportInsights(insights, filename = 'insights.csv') {
  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    { key: 'impactLevel', label: 'Impact' },
    { key: 'confidenceLevel', label: 'Confidence' },
    { key: 'evidence', label: 'Evidence' },
    { key: 'recommendedActions', label: 'Recommended Actions' },
    { key: 'productArea', label: 'Product Area' },
    { key: 'customerSegment', label: 'Customer Segment' },
    { key: 'projectSlug', label: 'Project' },
    { key: 'tags', label: 'Tags', accessor: (item) => (item.tags || []).join('; ') },
  ];

  exportToCSV(insights, filename, columns);
}

/**
 * Export actions to CSV
 */
export function exportActions(actions, filename = 'actions.csv') {
  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description' },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status' },
    { key: 'department', label: 'Department' },
    { key: 'effort', label: 'Effort' },
    { key: 'impact', label: 'Impact' },
    { key: 'successMetrics', label: 'Success Metrics' },
    { key: 'projectSlug', label: 'Project' },
  ];

  exportToCSV(actions, filename, columns);
}

/**
 * Export personas to JSON
 */
export function exportPersonas(personas, filename = 'personas.json') {
  exportToJSON(personas, filename);
}

/**
 * Generate a simple text report
 */
export function exportReport(data, filename = 'report.txt') {
  const { projectName, summary, insights, actions, personas } = data;
  
  let report = `# ${projectName} - Research Report\n\n`;
  report += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  if (summary) {
    report += `## Summary\n${summary}\n\n`;
  }
  
  if (insights && insights.length > 0) {
    report += `## Insights (${insights.length})\n\n`;
    insights.forEach((insight, idx) => {
      report += `${idx + 1}. ${insight.title}\n`;
      report += `   Category: ${insight.category} | Impact: ${insight.impactLevel}\n`;
      report += `   ${insight.evidence}\n\n`;
    });
  }
  
  if (actions && actions.length > 0) {
    report += `## Action Items (${actions.length})\n\n`;
    actions.forEach((action, idx) => {
      report += `${idx + 1}. [${action.priority}] ${action.title}\n`;
      report += `   Status: ${action.status} | Department: ${action.department}\n`;
      report += `   ${action.description}\n\n`;
    });
  }
  
  if (personas && personas.length > 0) {
    report += `## Personas (${personas.length})\n\n`;
    personas.forEach((persona, idx) => {
      report += `${idx + 1}. ${persona.name}\n`;
      report += `   Type: ${persona.type}\n\n`;
    });
  }
  
  downloadFile(report, filename, 'text/plain;charset=utf-8;');
}

/**
 * Helper function to trigger file download
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

