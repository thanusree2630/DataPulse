import React, { useState, useEffect } from 'react';
import { manualClean, getSummary } from '../services/api';
import toast from 'react-hot-toast';
import { FaTools, FaTrash, FaExclamationTriangle } from 'react-icons/fa';

function ManualCleaning({ sessionId, setSummary, summary }) {
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [loading, setLoading] = useState(false);
  const [missingActions, setMissingActions] = useState({});
  const [columnsWithMissing, setColumnsWithMissing] = useState([]);

  useEffect(() => {
    if (summary && summary.column_info) {
      const colsWithMissing = summary.column_info.filter(col => col.missing > 0);
      setColumnsWithMissing(colsWithMissing);
      
      // Initialize missing actions to 'none' for all columns with missing values
      const initialActions = {};
      colsWithMissing.forEach(col => {
        initialActions[col.name] = 'none';
      });
      setMissingActions(initialActions);
    }
  }, [summary]);

  const handleMissingActionChange = (columnName, action) => {
    setMissingActions(prev => ({
      ...prev,
      [columnName]: action
    }));
  };

  const getActionOptions = (dtype) => {
    const isNumeric = dtype === 'float64' || dtype === 'int64';
    
    if (isNumeric) {
      return [
        { value: 'none', label: 'Do Nothing' },
        { value: 'drop', label: 'Drop Rows' },
        { value: 'mean', label: 'Fill with Mean' },
        { value: 'median', label: 'Fill with Median' },
        { value: 'mode', label: 'Fill with Mode' },
        { value: 'forward_fill', label: 'Forward Fill' },
        { value: 'backward_fill', label: 'Backward Fill' }
      ];
    } else {
      return [
        { value: 'none', label: 'Do Nothing' },
        { value: 'drop', label: 'Drop Rows' },
        { value: 'mode', label: 'Fill with Mode' },
        { value: 'forward_fill', label: 'Forward Fill' },
        { value: 'backward_fill', label: 'Backward Fill' }
      ];
    }
  };

  const handleClean = async () => {
    setLoading(true);
    try {
      // Filter out 'none' actions
      const actionsToApply = {};
      Object.entries(missingActions).forEach(([col, action]) => {
        if (action !== 'none') {
          actionsToApply[col] = action;
        }
      });

      await manualClean({ 
        session_id: sessionId, 
        missing_actions: actionsToApply, 
        remove_duplicates: removeDuplicates 
      });
      const summaryRes = await getSummary(sessionId);
      setSummary(summaryRes.data);
      toast.success('Manual cleaning applied successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Cleaning failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cleaning-container">
      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">
            <FaTools />
            Manual Data Cleaning
          </h2>
          <p className="card-subtitle">
            Configure custom cleaning rules for your dataset
          </p>
        </div>

        <div className="alert alert-info">
          <span>💡</span>
          <span>Select specific cleaning actions to apply to your data. This gives you full control over the cleaning process.</span>
        </div>

        {/* Missing Values Section */}
        {columnsWithMissing.length > 0 && (
          <div className="form-section">
            <h3 className="section-title">
              <FaExclamationTriangle style={{ color: '#f59e0b' }} />
              Handle Missing Values ({columnsWithMissing.length} columns)
            </h3>
            
            <div className="missing-columns-list">
              {columnsWithMissing.map((col) => (
                <div key={col.name} className="missing-column-item">
                  <div className="column-info">
                    <div className="column-name">{col.name}</div>
                    <div className="column-stats">
                      <span className="stat-badge">Type: {col.dtype}</span>
                      <span className="stat-badge missing">
                        Missing: {col.missing} ({col.missing_pct.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                  <div className="column-action">
                    <select
                      className="form-select"
                      value={missingActions[col.name] || 'none'}
                      onChange={(e) => handleMissingActionChange(col.name, e.target.value)}
                    >
                      {getActionOptions(col.dtype).map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Duplicates Section */}
        <div className="form-section">
          <h3 className="section-title">Other Cleaning Options</h3>
          <div className="form-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                className="form-checkbox" 
                checked={removeDuplicates} 
                onChange={(e) => setRemoveDuplicates(e.target.checked)} 
              />
              <div>
                <div className="checkbox-title">
                  <FaTrash /> Remove Duplicate Rows
                </div>
                <div className="checkbox-description">
                  Automatically identify and remove exact duplicate rows from your dataset
                  {summary?.duplicates > 0 && (
                    <span className="duplicate-count"> ({summary.duplicates} duplicates found)</span>
                  )}
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="cleaning-actions">
          <button 
            onClick={handleClean} 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Applying Changes...' : 'Apply Manual Cleaning'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .form-section {
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .missing-columns-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .missing-column-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          gap: 1rem;
        }

        .column-info {
          flex: 1;
          min-width: 0;
        }

        .column-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .column-stats {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .stat-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #e5e7eb;
          color: #4b5563;
          border-radius: 1rem;
          font-size: 0.875rem;
        }

        .stat-badge.missing {
          background: #fef3c7;
          color: #92400e;
        }

        .column-action {
          min-width: 200px;
        }

        .form-select {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          background: white;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .form-select:focus {
          outline: none;
          border-color: #3b82f6;
          ring: 2px solid rgba(59, 130, 246, 0.2);
        }

        .duplicate-count {
          color: #dc2626;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .missing-column-item {
            flex-direction: column;
            align-items: stretch;
          }

          .column-action {
            min-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default ManualCleaning;