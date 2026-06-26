import React, { useState } from 'react';
import { autoClean, getSummary } from '../services/api';
import toast from 'react-hot-toast';
import { FaMagic, FaCheckCircle } from 'react-icons/fa';

function AutoCleaning({ sessionId, setSummary }) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const handleAutoClean = async () => {
    setLoading(true);
    try {
      const res = await autoClean({ session_id: sessionId });
      setReport(res.data.report);
      const summaryRes = await getSummary(sessionId);
      setSummary(summaryRes.data);
      toast.success('Auto cleaning completed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Auto cleaning failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cleaning-container">
      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">Automated Data Cleaning</h2>
          <p className="card-subtitle">
            One-click solution to handle missing values, remove duplicates, and cap outliers automatically
          </p>
        </div>

        <div className="cleaning-actions">
          <button 
            onClick={handleAutoClean} 
            className="btn btn-primary"
            disabled={loading}
          >
            <FaMagic />
            {loading ? 'Cleaning in Progress...' : 'Start Auto Cleaning'}
          </button>
        </div>
      </div>

      {report && (
        <div className="content-card slide-in">
          <div className="card-header">
            <h2 className="card-title">
              <FaCheckCircle style={{ color: 'var(--accent-green)' }} />
              Cleaning Report
            </h2>
          </div>

          <div className="report-grid">
            <div className="report-item">
              <div className="report-label">Rows Before</div>
              <div className="report-value">{report.rows_before.toLocaleString()}</div>
            </div>
            <div className="report-item">
              <div className="report-label">Rows After</div>
              <div className="report-value">{report.rows_after.toLocaleString()}</div>
            </div>
            <div className="report-item">
              <div className="report-label">Duplicates Removed</div>
              <div className="report-value">{report.duplicates_removed.toLocaleString()}</div>
            </div>
            <div className="report-item">
              <div className="report-label">Columns Cleaned</div>
              <div className="report-value">{Object.keys(report.missing_handled || {}).length}</div>
            </div>
            <div className="report-item">
              <div className="report-label">Outliers Capped</div>
              <div className="report-value">{Object.keys(report.outliers_capped || {}).length}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AutoCleaning;