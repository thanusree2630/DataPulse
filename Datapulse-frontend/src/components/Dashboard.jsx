import React from 'react';
import DataSummary from './DataSummary';
import ManualCleaning from './ManualCleaning';
import AutoCleaning from './AutoCleaning';
import Visualizations from './Visualizations';
import OutlierDetection from './OutlierDetection';
import MachineLearning from './MachineLearning';
import Insights from './Insights';
import DeveloperConsole from './DeveloperConsole';

const tabs = [
  { id: 'summary',  label: 'Overview',      icon: '📊', component: DataSummary },
  { id: 'manual',   label: 'Manual Clean',  icon: '🛠️', component: ManualCleaning },
  { id: 'auto',     label: 'Auto Clean',    icon: '⚡', component: AutoCleaning },
  { id: 'viz',      label: 'Visualize',     icon: '📈', component: Visualizations },
  { id: 'outliers', label: 'Outliers',      icon: '🎯', component: OutlierDetection },
  { id: 'ml',       label: 'ML Studio',     icon: '🤖', component: MachineLearning },
  { id: 'insights', label: 'Insights',      icon: '💡', component: Insights },
  { id: 'console',  label: 'Console',       icon: '💻', component: DeveloperConsole },
];

function Dashboard({ sessionId, filename, summary, setSummary, activeTab, setActiveTab }) {
  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || DataSummary;

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Analysis Dashboard</h1>
        <p className="dashboard-subtitle">
          <span className="file-badge">📄 {filename}</span>
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="tabs-wrapper">
        <div className="tabs-container">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="content-area">
        <div className="content-wrapper fade-in" key={activeTab}>
          <ActiveComponent
            sessionId={sessionId}
            summary={summary}
            setSummary={setSummary}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
