import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { getOutliers, treatOutliers, getSummary } from '../services/api';
import toast from 'react-hot-toast';
import { FaBullseye, FaCut, FaTrashAlt, FaCamera } from 'react-icons/fa';

function OutlierDetection({ sessionId, setSummary }) {
  const [outliers, setOutliers] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOutliers = () => {
      getOutliers(sessionId)
        .then(res => {
          setOutliers(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    };
    loadOutliers();
  }, [sessionId]);

  const handleTreat = async (column, method) => {
    try {
      await treatOutliers({ session_id: sessionId, column, method });
      const res = await getOutliers(sessionId);
      setOutliers(res.data);
      const summaryRes = await getSummary(sessionId);
      setSummary(summaryRes.data);
      toast.success(`Outliers ${method === 'cap' ? 'capped' : 'removed'} in ${column}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Treatment failed');
    }
  };

  const plotConfig = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
  };

  const plotLayout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#111827', family: 'Inter, sans-serif' },
    xaxis: { gridcolor: '#e5e7eb' },
    yaxis: { gridcolor: '#e5e7eb' },
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Detecting outliers...</p>
      </div>
    );
  }

  if (!outliers || Object.keys(outliers).length === 0) {
    return (
      <div className="content-card">
        <div className="alert alert-success">
          <span>✅</span>
          <span>No outliers detected in your dataset!</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Camera Icon Instruction */}
      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">
            <FaBullseye />
            Outlier Detection
          </h2>
          <p className="card-subtitle">
            Identify and treat outliers in numerical columns using IQR method
          </p>
        </div>
        
        {/* Download Instruction */}
        <div className="alert alert-info" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          background: '#dbeafe',
          border: '1px solid #3b82f6',
          borderRadius: '8px',
          padding: '1rem',
          marginTop: '1rem'
        }}>
          <FaCamera style={{ fontSize: '20px', color: '#2563eb' }} />
          <span style={{ color: '#1e40af', fontSize: '14px', fontWeight: '500' }}>
            To download box plots, hover over the chart and click the <strong>camera icon (📷)</strong> in the top-right corner
          </span>
        </div>
      </div>

      {Object.entries(outliers).map(([col, info]) => {
        const boxPlotData = [{
          type: 'box',
          y: info.values || [],
          name: col,
          marker: { color: '#2563eb' },
          boxmean: 'sd'
        }];

        return (
          <div key={col} className="outlier-card fade-in">
            <div className="outlier-header">
              <div>
                <h3 className="outlier-column-name">{col}</h3>
              </div>
              <div
                style={{
                  padding: '0.375rem 0.875rem',
                  background: info.outlier_count > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  border: `1px solid ${info.outlier_count > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                  borderRadius: 'var(--radius-full)',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: info.outlier_count > 0 ? '#ef4444' : '#10b981',
                }}
              >
                {info.outlier_count} outliers
              </div>
            </div>

            {/* Outlier Statistics */}
            <div className="outlier-stats">
              <div className="outlier-stat">
                <div className="outlier-stat-label">Outlier Count</div>
                <div className="outlier-stat-value">{info.outlier_count.toLocaleString()}</div>
              </div>
              <div className="outlier-stat">
                <div className="outlier-stat-label">Percentage</div>
                <div className="outlier-stat-value">{info.outlier_percentage.toFixed(2)}%</div>
              </div>
              <div className="outlier-stat">
                <div className="outlier-stat-label">Lower Bound</div>
                <div className="outlier-stat-value">{info.lower_bound.toFixed(2)}</div>
              </div>
              <div className="outlier-stat">
                <div className="outlier-stat-label">Upper Bound</div>
                <div className="outlier-stat-value">{info.upper_bound.toFixed(2)}</div>
              </div>
            </div>

            {/* Box Plot - NO DOWNLOAD BUTTON */}
            <div style={{ marginTop: 'var(--spacing-lg)' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)' }}>
                Box Plot
              </h4>
              <div className="plotly-container">
                <Plot
                  data={boxPlotData}
                  layout={{
                    title: `Distribution of ${col}`,
                    yaxis: { title: col },
                    ...plotLayout,
                    height: 400
                  }}
                  config={plotConfig}
                  style={{ width: '100%' }}
                  useResizeHandler={true}
                />
              </div>
            </div>

            {/* Treatment Actions */}
            {info.outlier_count > 0 && (
              <div className="outlier-actions" style={{ marginTop: 'var(--spacing-lg)' }}>
                <button 
                  onClick={() => handleTreat(col, 'cap')} 
                  className="btn btn-primary"
                >
                  <FaCut />
                  Cap Outliers
                </button>
                <button 
                  onClick={() => handleTreat(col, 'remove')} 
                  className="btn btn-outline"
                >
                  <FaTrashAlt />
                  Remove Outliers
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default OutlierDetection;