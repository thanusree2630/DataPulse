import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { getVisualizations } from '../services/api';
import { FaChartBar, FaCamera } from 'react-icons/fa';
import toast from 'react-hot-toast';

function Visualizations({ sessionId }) {
  const [viz, setViz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customChart, setCustomChart] = useState({
    type: 'scatter',
    xAxis: '',
    yAxis: '',
    colorBy: ''
  });
  const [customChartFig, setCustomChartFig] = useState(null);
  const [customChartLoading, setCustomChartLoading] = useState(false);

  useEffect(() => {
    const loadVisualizations = () => {
      getVisualizations(sessionId)
        .then(res => {
          setViz(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    };
    loadVisualizations();
  }, [sessionId]);

  // Get columns for dropdowns based on chart type selected
  const getColumnsForChart = () => {
    const allNumerical = viz?.distributions?.numerical?.map(item => item.column) || [];
    const allCategorical = viz?.distributions?.categorical?.map(item => item.column) || [];
    
    switch (customChart.type) {
      case 'histogram':
        // Histogram: Only numerical X-axis, no Y-axis
        return { 
          xOptions: allNumerical, 
          yOptions: [], 
          showY: false,
          xLabel: 'X-Axis (Numerical)',
          yLabel: 'Y-Axis'
        };
      
      case 'pie':
        // Pie chart: Categorical for labels, Numerical for values
        return { 
          xOptions: allCategorical, 
          yOptions: allNumerical, 
          showY: true,
          xLabel: 'Labels (Categorical)',
          yLabel: 'Values (Numerical)'
        };
      
      case 'box':
      case 'violin':
        // Box/Violin: Optional categorical X, required numerical Y
        return { 
          xOptions: allCategorical, 
          yOptions: allNumerical, 
          showY: true,
          xLabel: 'X-Axis (Optional, Categorical)',
          yLabel: 'Y-Axis (Numerical)'
        };
      
      default: // scatter, line, bar
        // Standard charts: Any column for X, numerical for Y
        return { 
          xOptions: [...allNumerical, ...allCategorical], 
          yOptions: allNumerical, 
          showY: true,
          xLabel: 'X-Axis',
          yLabel: 'Y-Axis (Numerical)'
        };
    }
  };

  const columnConfig = getColumnsForChart();

  // Reset axes when chart type changes
  const handleChartTypeChange = (newType) => {
    setCustomChart({
      type: newType,
      xAxis: '',
      yAxis: '',
      colorBy: ''
    });
  };

  const generateCustomChart = () => {
    const { type, xAxis, yAxis } = customChart;
    
    // Validation based on chart type
    if (type === 'histogram' && !xAxis) {
      toast.error('Please select X axis for histogram');
      return;
    }
    
    if (type === 'pie' && (!xAxis || !yAxis)) {
      toast.error('Please select both Labels and Values for pie chart');
      return;
    }
    
    if ((type === 'box' || type === 'violin') && !yAxis) {
      toast.error('Please select Y axis for box/violin plot');
      return;
    }
    
    if ((type === 'scatter' || type === 'line' || type === 'bar') && (!xAxis || !yAxis)) {
      toast.error('Please select both X and Y axes');
      return;
    }

    setCustomChartLoading(true);

    fetch(`http://localhost:5000/api/visualizations/${sessionId}/custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customChart)
    })
      .then(res => res.json())
      .then(data => {
        if (data.figure) {
          setCustomChartFig(data.figure);
          toast.success('Custom chart generated!');
        } else {
          toast.error('Failed to generate chart');
        }
        setCustomChartLoading(false);
      })
      .catch(err => {
        console.error(err);
        toast.error('Failed to generate custom chart');
        setCustomChartLoading(false);
      });
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Generating visualizations...</p>
      </div>
    );
  }

  if (!viz) {
    return (
      <div className="error-state">
        <p>Failed to load visualizations</p>
      </div>
    );
  }

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

  const categoricalColumns = viz?.distributions?.categorical?.map(item => item.column) || [];

  return (
    <div className="viz-container">
      {/* Header with Camera Icon Instruction */}
      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">
            <FaChartBar />
            Data Visualizations
          </h2>
          <p className="card-subtitle">
            Interactive charts and statistical plots for your dataset
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
            To download any chart, hover over it and click the <strong>camera icon (📷)</strong> in the top-right corner
          </span>
        </div>
      </div>

      {/* Numerical Distributions */}
      {viz?.distributions?.numerical?.map((item, idx) => (
        <div key={idx} className="viz-card fade-in">
          <div className="viz-header">
            <h3 className="viz-title">{item.column} - Distribution</h3>
          </div>
          <div className="plotly-container">
            <Plot
              data={JSON.parse(item.figure).data}
              layout={{
                ...JSON.parse(item.figure).layout,
                ...plotLayout,
              }}
              config={plotConfig}
              style={{ width: '100%' }}
              useResizeHandler={true}
            />
          </div>
        </div>
      ))}

      {/* Categorical Distributions */}
      {viz?.distributions?.categorical?.map((item, idx) => (
        <div key={idx} className="viz-card fade-in">
          <div className="viz-header">
            <h3 className="viz-title">{item.column} - Bar Chart</h3>
          </div>
          <div className="plotly-container">
            <Plot
              data={JSON.parse(item.figure).data}
              layout={JSON.parse(item.figure).layout}
              config={plotConfig}
              style={{ width: '100%' }}
              useResizeHandler={true}
            />
          </div>
        </div>
      ))}

      {/* Correlation Heatmap */}
      {viz?.correlations?.heatmap && (
        <div className="viz-card fade-in">
          <div className="viz-header">
            <h3 className="viz-title">Correlation Heatmap</h3>
          </div>
          <div className="plotly-container">
            <Plot
              data={JSON.parse(viz.correlations.heatmap).data}
              layout={{
                ...JSON.parse(viz.correlations.heatmap).layout,
                ...plotLayout,
              }}
              config={plotConfig}
              style={{ width: '100%' }}
              useResizeHandler={true}
            />
          </div>
        </div>
      )}

      {/* Correlation Scatter */}
      {viz?.correlations?.scatter && (
        <div className="viz-card fade-in">
          <div className="viz-header">
            <h3 className="viz-title">Correlation Scatter Plot</h3>
          </div>
          <div className="plotly-container">
            <Plot
              data={JSON.parse(viz.correlations.scatter).data}
              layout={{
                ...JSON.parse(viz.correlations.scatter).layout,
                ...plotLayout,
              }}
              config={plotConfig}
              style={{ width: '100%' }}
              useResizeHandler={true}
            />
          </div>
        </div>
      )}

      {/* Custom Chart Builder */}
      <div className="content-card custom-chart-section">
        <h3 className="custom-chart-title">📊 Custom Chart Builder</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
          Create your own custom visualizations by selecting chart type and axes
        </p>
        
        <div className="custom-chart-form">
          {/* Chart Type Selection */}
          <div className="form-group">
            <label className="form-label">Chart Type</label>
            <select 
              className="form-select"
              value={customChart.type}
              onChange={(e) => handleChartTypeChange(e.target.value)}
            >
              <option value="scatter">Scatter Plot</option>
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
              <option value="box">Box Plot</option>
              <option value="violin">Violin Plot</option>
              <option value="histogram">Histogram</option>
              <option value="pie">Pie Chart</option>
            </select>
          </div>

          {/* X-Axis Selection */}
          <div className="form-group">
            <label className="form-label">{columnConfig.xLabel}</label>
            <select 
              className="form-select"
              value={customChart.xAxis}
              onChange={(e) => setCustomChart({...customChart, xAxis: e.target.value})}
            >
              <option value="">Select column...</option>
              {columnConfig.xOptions.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          {/* Y-Axis Selection (conditional) */}
          {columnConfig.showY && (
            <div className="form-group">
              <label className="form-label">{columnConfig.yLabel}</label>
              <select 
                className="form-select"
                value={customChart.yAxis}
                onChange={(e) => setCustomChart({...customChart, yAxis: e.target.value})}
              >
                <option value="">Select column...</option>
                {columnConfig.yOptions.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
          )}

          {/* Color By (Optional) - Not for pie charts */}
          {customChart.type !== 'pie' && customChart.type !== 'histogram' && (
            <div className="form-group">
              <label className="form-label">Color By (Optional)</label>
              <select 
                className="form-select"
                value={customChart.colorBy}
                onChange={(e) => setCustomChart({...customChart, colorBy: e.target.value})}
              >
                <option value="">None</option>
                {categoricalColumns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button 
          onClick={generateCustomChart}
          className="btn btn-primary"
          disabled={customChartLoading}
        >
          {customChartLoading ? 'Generating...' : 'Generate Custom Chart'}
        </button>

        {/* Display Custom Chart */}
        {customChartFig && (
          <div className="viz-card" style={{ marginTop: 'var(--spacing-lg)' }}>
            <div className="viz-header">
              <h3 className="viz-title">Custom Chart</h3>
            </div>
            <div className="plotly-container">
              <Plot
                data={JSON.parse(customChartFig).data}
                layout={{
                  ...JSON.parse(customChartFig).layout,
                  ...plotLayout,
                }}
                config={plotConfig}
                style={{ width: '100%' }}
                useResizeHandler={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Visualizations;
