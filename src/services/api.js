/**
 * SENTRA API Service
 * Handles all communication with the backend API
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 30000;

class APIError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.status = status;
    this.details = details;
    this.name = 'APIError';
  }
}

/**
 * Helper function to handle API requests
 */
async function apiRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    body = null,
    timeout = API_TIMEOUT,
    retries = 1
  } = options;

  let lastError;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: controller.signal
      };

      if (body) {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(`${API_BASE}${endpoint}`, config);

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
          response.status,
          errorData.detail || 
          errorData.message || 
          `HTTP ${response.status}: ${response.statusText}`,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      lastError = error;
      
      if (error.name === 'AbortError') {
        lastError = new APIError(
          null,
          `Request timeout after ${timeout}ms`,
          null
        );
      }

      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError;
}

/**
 * Health check - verify API is online
 */
export async function healthCheck() {
  return apiRequest('/api/health');
}

/**
 * Get process list with CPU usage
 */
export async function getProcesses() {
  return apiRequest('/api/system/processes');
}

/**
 * Get historical system stats
 */
export async function getStatsHistory() {
  return apiRequest('/api/system/stats-history');
}

/**
 * Perform system cleanup (delete temp files, flush DNS)
 */
export async function performCleanup() {
  return apiRequest('/api/actions/cleanup', { method: 'POST' });
}

/**
 * Update threat intelligence database
 */
export async function updateIntelligence() {
  return apiRequest('/api/engine/update', { method: 'POST' });
}

/**
 * Run security scan
 */
export async function runSecurityScan() {
  return apiRequest('/api/engine/scan', { 
    method: 'GET',
    timeout: 60000 // Allow 60 seconds for scan
  });
}

/**
 * Get system information
 */
export async function getSystemInfo() {
  return apiRequest('/api/system/info');
}

export { APIError };