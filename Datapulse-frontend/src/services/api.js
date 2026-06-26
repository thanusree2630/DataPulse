import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://datapulse-backend-ojwl.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadFile = (formData) => {
  return api.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getSummary = (sessionId) => {
  return api.get(`/api/summary/${sessionId}`);
};

export const manualClean = (data) => {
  return api.post('/api/clean/manual', data);
};

export const autoClean = (data) => {
  return api.post('/api/clean/auto', data);
};

export const getVisualizations = (sessionId, type = 'all') => {
  return api.get(`/api/visualizations/${sessionId}?type=${type}`);
};

export const getOutliers = (sessionId) => {
  return api.get(`/api/outliers/${sessionId}`);
};

export const treatOutliers = (data) => {
  return api.post('/api/outliers/treat', data);
};

export const trainModel = (data) => {
  return api.post('/api/ml/train', data);
};

export const predict = (data) => {
  return api.post('/api/ml/predict', data);
};

export const makePrediction = (data) => {
  return api.post('/api/ml/predict', data);
};

export const getInsights = (sessionId, type = 'enhanced') => {
  return api.get(`/api/insights/${sessionId}?type=${type}`);
};

export const downloadData = (sessionId) => {
  return `${API_URL}/api/download/${sessionId}`;
};

export const downloadModel = (sessionId) => {
  return `${API_URL}/api/download/model/${sessionId}`;
};

export const getSuitableColumns = (sessionId, taskType = 'classification') => {
  return api.get(`/api/ml/suitable-columns/${sessionId}?task_type=${taskType}`);
};

export const getBoxplot = (sessionId, column) => {
  return api.get(`/api/outliers/${sessionId}/boxplot/${column}`);
};

export const createCustomVisualization = (sessionId, chartConfig) => {
  return api.post(`/api/visualizations/${sessionId}/custom`, chartConfig);
};

export const saveReportContext = (data) => {
  return api.post('/api/report/save-context', data);
};

export const downloadReportDocx = (sessionId) => {
  return `${API_URL}/api/report/download/docx/${sessionId}`;
};

export const downloadReportPdf = (sessionId) => {
  return `${API_URL}/api/report/download/pdf/${sessionId}`;
};

export const executeCode = (data) => {
  return api.post('/api/notebook/execute', data);
};

export const uploadSecondary = (formData) => {
  return api.post('/api/upload_secondary', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const healthCheck = () => {
  return api.get('/api/health');
};

export default api;
