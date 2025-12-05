import axios from 'axios'

const API_BASE = '/api'

// Data Management
export const dataService = {
  uploadFile: (formData, onProgress) => {
    return axios.post(`${API_BASE}/data/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    })
  },
  uploadMultipleFiles: (formData, onProgress) => {
    return axios.post(`${API_BASE}/data/upload-multiple`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    })
  },
  getTables: (params) => axios.get(`${API_BASE}/data/tables`, { params }),
  getTable: (tableId) => axios.get(`${API_BASE}/data/tables/${tableId}`),
  getTableData: (tableId, params) => axios.get(`${API_BASE}/data/tables/${tableId}/data`, { params }),
  exportTable: (tableId, format) => axios.get(`${API_BASE}/data/tables/${tableId}/export`, { params: { format }, responseType: 'blob' }),
  // New: export cleaned data
  exportCleanedTable: (tableId, format) => axios.get(`${API_BASE}/data/tables/${tableId}/export`, { params: { format, cleaned: true }, responseType: 'blob' }),
  // New: cleaned status
  getCleanedStatus: (tableId) => axios.get(`${API_BASE}/data/tables/${tableId}/cleaned-status`),
  // Manual remediation
  applyManualRemediation: (tableId, issueId, optionId) => axios.post(`${API_BASE}/data/tables/${tableId}/apply-remediation`, { issueId, optionId }),
  deleteTable: (tableId) => axios.delete(`${API_BASE}/data/tables/${tableId}`)
}

// Profiling
export const profileService = {
  getProfile: (tableId) => axios.get(`${API_BASE}/profile/${tableId}`),
  getAllProfiles: (params) => axios.get(`${API_BASE}/profile`, { params }),
  getColumnProfile: (tableId, columnName) => axios.get(`${API_BASE}/profile/${tableId}/column/${columnName}`),
  compareProfiles: (tableId, params) => axios.get(`${API_BASE}/profile/${tableId}/compare`, { params })
}

// Quality
export const qualityService = {
  getSummary: () => axios.get(`${API_BASE}/quality/summary`),
  getKPIDashboard: (tableId) => axios.get(`${API_BASE}/quality/dashboard/${tableId}`),
  getAllKPIs: () => axios.get(`${API_BASE}/quality/dashboards`),
  getTrends: (tableId, days) => axios.get(`${API_BASE}/quality/trends/${tableId}`, { params: { days } })
}

// Issues
export const issueService = {
  getIssues: (params) => axios.get(`${API_BASE}/issues`, { params }),
  getIssue: (issueId) => axios.get(`${API_BASE}/issues/${issueId}`),
  updateStatus: (issueId, status) => axios.patch(`${API_BASE}/issues/${issueId}/status`, { status }),
  deleteIssue: (issueId) => axios.delete(`${API_BASE}/issues/${issueId}`),
  getStatistics: (params) => axios.get(`${API_BASE}/issues/statistics`, { params }),
  overrideScore: (issueId, severity, score, reason) => axios.post(`${API_BASE}/issues/${issueId}/override`, { severity, score, reason }),
  removeOverride: (issueId) => axios.delete(`${API_BASE}/issues/${issueId}/override`)
}

// Scoring Configuration
export const scoringService = {
  getConfig: () => axios.get(`${API_BASE}/scoring/config`),
  updateConfig: (config) => axios.put(`${API_BASE}/scoring/config`, config)
}

// Remediation
export const remediationService = {
  getSuggestions: (issueId) => axios.get(`${API_BASE}/remediation/suggestions/${issueId}`)
}

// Monitoring
export const monitoringService = {
  getStatus: () => axios.get(`${API_BASE}/monitoring/status`),
  getAlerts: (params) => axios.get(`${API_BASE}/monitoring/alerts`, { params }),
  getFlaggedIssues: () => axios.get(`${API_BASE}/monitoring/flagged-issues`),
  applyManualReview: (issueId, action, updates) => axios.post(`${API_BASE}/monitoring/manual-review/${issueId}`, { action, updates }),
  markAlertAsRead: (alertId) => axios.patch(`${API_BASE}/monitoring/alerts/${alertId}/read`),
  dismissAlert: (alertId) => axios.patch(`${API_BASE}/monitoring/alerts/${alertId}/dismiss`)
}


