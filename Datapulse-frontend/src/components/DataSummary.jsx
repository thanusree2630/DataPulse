import React, { useEffect, useState } from 'react';
import { getSummary } from '../services/api';
import { FaTable, FaColumns, FaExclamationTriangle, FaCopy, FaChartBar, FaInfoCircle, FaCalculator } from 'react-icons/fa';

function DataSummary({ sessionId, summary }) {
  const [data, setData] = useState(summary || null);
  const [loading, setLoading] = useState(!summary);

  useEffect(() => {
    if (!data && sessionId) {
      getSummary(sessionId).then(res => {
        setData(res.data);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [sessionId, data]);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading dataset summary...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="error-state">
        <FaExclamationTriangle />
        <p>Failed to load summary data</p>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Rows',
      value: data.shape.rows.toLocaleString(),
      icon: <FaTable />,
      color: 'blue',
    },
    {
      label: 'Columns',
      value: data.shape.columns,
      icon: <FaColumns />,
      color: 'purple',
    },
    {
      label: 'Missing Values',
      value: data.missing_total,
      icon: <FaExclamationTriangle />,
      color: 'orange',
    },
    {
      label: 'Duplicates',
      value: data.duplicates,
      icon: <FaCopy />,
      color: 'red',
    },
  ];

  // Separate numerical and categorical columns
  const numericalColumns = data.column_info.filter(col => 
    col.dtype === 'float64' || col.dtype === 'int64'
  );
  
  const categoricalColumns = data.column_info.filter(col => 
    col.dtype === 'object' || col.dtype === 'category'
  );

  return (
    <div className="summary-container">
      {/* Stats Cards */}
      <div className="stats-grid-modern">
        {stats.map((stat, idx) => (
          <div key={idx} className={`stat-card-modern stat-${stat.color}`}>
            <div className="stat-icon-wrapper">
              {stat.icon}
            </div>
            <div className="stat-content">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
            <div className="stat-decoration"></div>
          </div>
        ))}
      </div>

      {/* Column Information Table */}
      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">
            <FaTable />
            Column Information
          </h2>
          <p className="card-subtitle">Detailed overview of all columns in your dataset</p>
        </div>
        
        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Column Name</th>
                <th>Data Type</th>
                <th>Missing Values</th>
                <th>Unique Values</th>
              </tr>
            </thead>
            <tbody>
              {data.column_info.map((col, idx) => (
                <tr key={idx}>
                  <td>
                    <span className="column-name">{col.name}</span>
                  </td>
                  <td>
                    <span className="type-badge">{col.dtype}</span>
                  </td>
                  <td>
                    <div className="missing-cell">
                      <span className="missing-count">{col.missing}</span>
                      <span className="missing-percent">({col.missing_pct.toFixed(1)}%)</span>
                    </div>
                  </td>
                  <td>
                    <span className="unique-count">{col.unique.toLocaleString()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistical Summary (df.describe()) */}
      {numericalColumns.length > 0 && (
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">
              <FaCalculator />
              Statistical Summary (Numerical Columns)
            </h2>
            <p className="card-subtitle">Statistical analysis similar to df.describe()</p>
          </div>
          
          <div className="table-wrapper">
            <table className="modern-table stats-table">
              <thead>
                <tr>
                  <th>Column</th>
                  <th>Count</th>
                  <th>Mean</th>
                  <th>Std Dev</th>
                  <th>Min</th>
                  <th>25%</th>
                  <th>50% (Median)</th>
                  <th>75%</th>
                  <th>Max</th>
                </tr>
              </thead>
              <tbody>
                {numericalColumns.map((col, idx) => (
                  <tr key={idx}>
                    <td><strong>{col.name}</strong></td>
                    <td>{(data.shape.rows - col.missing).toLocaleString()}</td>
                    <td>{col.mean !== null ? col.mean.toFixed(2) : 'N/A'}</td>
                    <td>{col.std !== null ? col.std.toFixed(2) : 'N/A'}</td>
                    <td>{col.min !== null ? col.min.toFixed(2) : 'N/A'}</td>
                    <td>{col.q25 !== null && col.q25 !== undefined ? col.q25.toFixed(2) : 'N/A'}</td>
                    <td>{col.median !== null ? col.median.toFixed(2) : 'N/A'}</td>
                    <td>{col.q75 !== null && col.q75 !== undefined ? col.q75.toFixed(2) : 'N/A'}</td>
                    <td>{col.max !== null ? col.max.toFixed(2) : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categorical Summary (value_counts()) */}
      {categoricalColumns.length > 0 && (
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">
              <FaChartBar />
              Categorical Summary (Value Counts)
            </h2>
            <p className="card-subtitle">Top values for each categorical column</p>
          </div>
          
          <div className="categorical-summary-grid">
            {categoricalColumns.map((col, idx) => (
              <div key={idx} className="categorical-card">
                <div className="categorical-header">
                  <h3>{col.name}</h3>
                  <span className="unique-badge">{col.unique} unique values</span>
                </div>
                
                {col.top_values ? (
                  <div className="value-counts-list">
                    {Object.entries(col.top_values).slice(0, 10).map(([value, count], i) => (
                      <div key={i} className="value-count-item">
                        <span className="value-label">{value}</span>
                        <div className="count-info">
                          <span className="count-number">{count}</span>
                          <div className="count-bar">
                            <div 
                              className="count-bar-fill" 
                              style={{ 
                                width: `${(count / data.shape.rows * 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {col.unique > 10 && (
                      <div className="more-values">
                        + {col.unique - 10} more values
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-data">No value counts available</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DataFrame Info (df.info()) */}
      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">
            <FaInfoCircle />
            DataFrame Information
          </h2>
          <p className="card-subtitle">Memory usage and data types information similar to df.info()</p>
        </div>
        
        <div className="info-section">
          {/* Basic Info */}
          <div className="info-box">
            <h3 className="info-title">Basic Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">RangeIndex:</span>
                <span className="info-value">{data.shape.rows} entries, 0 to {data.shape.rows - 1}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Data columns:</span>
                <span className="info-value">{data.shape.columns} columns</span>
              </div>
              <div className="info-item">
                <span className="info-label">Total memory usage:</span>
                <span className="info-value">{data.memory_usage.toFixed(2)} MB</span>
              </div>
            </div>
          </div>

          {/* Column Details */}
          <div className="info-box">
            <h3 className="info-title">Column Details</h3>
            <div className="info-columns-table">
              <div className="info-table-header">
                <span className="col-index">#</span>
                <span className="col-name">Column</span>
                <span className="col-non-null">Non-Null Count</span>
                <span className="col-dtype">Dtype</span>
              </div>
              {data.column_info.map((col, idx) => (
                <div key={idx} className="info-table-row">
                  <span className="col-index">{idx}</span>
                  <span className="col-name">{col.name}</span>
                  <span className="col-non-null">
                    {(data.shape.rows - col.missing).toLocaleString()} non-null
                  </span>
                  <span className="col-dtype">{col.dtype}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Data Types Summary */}
          <div className="info-box">
            <h3 className="info-title">Dtypes Summary</h3>
            <div className="dtypes-summary">
              {Object.entries(
                data.column_info.reduce((acc, col) => {
                  acc[col.dtype] = (acc[col.dtype] || 0) + 1;
                  return acc;
                }, {})
              ).map(([dtype, count], idx) => (
                <div key={idx} className="dtype-item">
                  <span className="dtype-name">{dtype}</span>
                  <span className="dtype-count">({count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .stats-table {
          font-size: 0.9rem;
        }

        .stats-table th {
          font-size: 0.85rem;
          white-space: nowrap;
        }

        .stats-table td {
          text-align: center;
        }

        .stats-table td:first-child {
          text-align: left;
        }

        .categorical-summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .categorical-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1.25rem;
        }

        .categorical-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .categorical-header h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .unique-badge {
          background: #dbeafe;
          color: #1e40af;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .value-counts-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .value-count-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .value-label {
          flex-shrink: 0;
          font-weight: 500;
          color: #374151;
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .count-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }

        .count-number {
          font-weight: 600;
          color: #6b7280;
          min-width: 50px;
          text-align: right;
        }

        .count-bar {
          flex: 1;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .count-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .more-values {
          text-align: center;
          color: #6b7280;
          font-size: 0.875rem;
          font-style: italic;
          padding-top: 0.5rem;
          border-top: 1px dashed #e5e7eb;
        }

        .no-data {
          text-align: center;
          color: #9ca3af;
          padding: 2rem;
          font-style: italic;
        }

        .info-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .info-box {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1.5rem;
        }

        .info-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 1rem 0;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .info-label {
          font-weight: 600;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .info-value {
          font-family: 'Courier New', monospace;
          color: #1f2937;
          font-size: 0.9rem;
        }

        .info-columns-table {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
        }

        .info-table-header {
          display: grid;
          grid-template-columns: 50px 2fr 2fr 1fr;
          gap: 1rem;
          padding: 0.75rem;
          background: #e5e7eb;
          border-radius: 0.375rem;
          font-weight: 600;
          color: #374151;
        }

        .info-table-row {
          display: grid;
          grid-template-columns: 50px 2fr 2fr 1fr;
          gap: 1rem;
          padding: 0.75rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          transition: background 0.2s;
        }

        .info-table-row:hover {
          background: #f3f4f6;
        }

        .col-index {
          color: #6b7280;
          font-weight: 500;
        }

        .col-name {
          color: #1f2937;
          font-weight: 600;
        }

        .col-non-null {
          color: #059669;
        }

        .col-dtype {
          color: #7c3aed;
          font-weight: 500;
        }

        .dtypes-summary {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .dtype-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
        }

        .dtype-name {
          font-family: 'Courier New', monospace;
          color: #7c3aed;
          font-weight: 600;
        }

        .dtype-count {
          color: #6b7280;
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .categorical-summary-grid {
            grid-template-columns: 1fr;
          }

          .info-table-header,
          .info-table-row {
            grid-template-columns: 40px 1.5fr 1.5fr 1fr;
            gap: 0.5rem;
            font-size: 0.75rem;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default DataSummary;