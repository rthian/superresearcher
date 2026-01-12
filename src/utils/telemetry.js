import { TELEMETRY_ENDPOINT, VERSION } from '../config/constants.js';
import { readGlobalConfig } from './files.js';
import os from 'os';

/**
 * Send anonymous telemetry (if enabled)
 */
export async function trackEvent(event, properties = {}) {
  try {
    const config = await readGlobalConfig();
    
    // Check if telemetry is disabled
    if (!config.telemetry || process.env.SUPERRESEARCHER_TELEMETRY === '0') {
      return;
    }

    const payload = {
      event,
      properties: {
        ...properties,
        version: VERSION,
        os: os.platform(),
        nodeVersion: process.version
      },
      timestamp: new Date().toISOString()
    };

    // Non-blocking telemetry - don't await
    fetch(TELEMETRY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {
      // Silently fail - telemetry should never block execution
    });
  } catch {
    // Silently fail
  }
}

/**
 * Track command execution
 */
export function trackCommand(command, options = {}) {
  return trackEvent('command_executed', {
    command,
    hasAgent: !!options.agent,
    ...options
  });
}
