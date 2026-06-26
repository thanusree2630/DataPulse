import React, { useState, useEffect } from 'react';
import { trainModel, makePrediction } from '../services/api';
import toast from 'react-hot-toast';
import { FaRobot, FaCog, FaDownload, FaCheckCircle, FaChartBar, FaMagic } from 'react-icons/fa';
import Plot from 'react-plotly.js';
import ReportGenerator from './ReportGenerator';
import './MachineLearning.css'; 

function MachineLearning({ sessionId, summary }) {
  // State for training
  const [targetColumn, setTargetColumn] = useState('');
  const [taskType, setTaskType] = useState('');
  const [modelType, setModelType] = useState('');
  const [testSize, setTestSize] = useState(0.2);
  const [tuneParams, setTuneParams] = useState(false);
  const [training, setTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [report, setReport] = useState(null);
  const [modelFilename, setModelFilename] = useState(null);
  const [confusionMatrix, setConfusionMatrix] = useState(null);
  const [trainedFeatures, setTrainedFeatures] = useState([]);
  
  // State for prediction
  const [activeTab, setActiveTab] = useState('training'); // 'training' or 'prediction'
  const [predictionInputs, setPredictionInputs] = useState({});
  const [predicting, setPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);

  // Automatically detect task type when target column changes
  useEffect(() => {
    if (!targetColumn || !summary || !summary.column_info) {
      setTaskType('');
      setModelType('');
      return;
    }

    const columnInfo = summary.column_info.find(col => col.name === targetColumn);
    if (!columnInfo) return;

    // Check if column is numerical
    const isNumeric = columnInfo.dtype === 'int64' || columnInfo.dtype === 'float64';
    
    if (isNumeric) {
      // Check unique values for classification vs regression
      if (columnInfo.unique <= 20) {
        // Few unique values - could be classification
        const detectedType = columnInfo.unique <= 2 ? 'classification' : 'multiclass';
        setTaskType(detectedType);
        setModelType('RandomForestClassifier');
      } else {
        // Many unique values - regression
        setTaskType('regression');
        setModelType('RandomForestRegressor');
      }
    } else {
      // Categorical column - classification
      const detectedType = columnInfo.unique <= 2 ? 'classification' : 'multiclass';
      setTaskType(detectedType);
      setModelType('RandomForestClassifier');
    }
  }, [targetColumn, summary]);

  // Get all columns for target selection
  const getAllColumns = () => {
    if (!summary || !summary.column_info) return [];
    return summary.column_info;
  };

  const allColumns = getAllColumns();

  // Get task type label
  const getTaskTypeLabel = () => {
    if (!taskType) return 'Select target column first';
    if (taskType === 'classification') return '🎯 Binary Classification (2 classes)';
    if (taskType === 'multiclass') return '🎯 Multi-class Classification (3+ classes)';
    if (taskType === 'regression') return '📈 Regression (Continuous values)';
    return '';
  };

  // Simulate training progress
  const simulateProgress = () => {
    setTrainingProgress(0);
    const stages = [
      { progress: 15, delay: 500, message: 'Preprocessing data...' },
      { progress: 30, delay: 800, message: 'Splitting train/test sets...' },
      { progress: 50, delay: 1200, message: 'Training model...' },
      { progress: 70, delay: 1500, message: tuneParams ? 'Tuning hyperparameters...' : 'Fitting model...' },
      { progress: 85, delay: 1000, message: 'Evaluating performance...' },
      { progress: 95, delay: 500, message: 'Computing metrics...' }
    ];

    stages.forEach(({ progress, delay, message }, index) => {
      setTimeout(() => {
        setTrainingProgress(progress);
        if (message) toast(message, { duration: 1500, icon: '⏳' });
      }, stages.slice(0, index).reduce((sum, s) => sum + s.delay, 0));
    });
  };

  const handleTrain = async () => {
    if (!targetColumn) {
      toast.error('Please select a target column');
      return;
    }

    if (!taskType) {
      toast.error('Unable to detect task type for selected column');
      return;
    }

    setTraining(true);
    setReport(null);
    setConfusionMatrix(null);
    setTrainingProgress(0);
    simulateProgress();
    
    try {
      const response = await trainModel({
        session_id: sessionId,
        task_type: taskType === 'multiclass' ? 'classification' : taskType,
        model_type: modelType,
        target_column: targetColumn,
        test_size: testSize,
        tune_params: tuneParams
      });
      
      console.log('Training response:', response.data); // Debug log
      
      setTrainingProgress(100);
      setTimeout(() => {
        setReport(response.data.report);
        setModelFilename(response.data.model_filename);
        
        // Get features from response or fallback to all columns except target
        let features = response.data.features || [];
        if (!features.length && summary && summary.column_info) {
          features = summary.column_info
            .map(col => col.name)
            .filter(name => name !== targetColumn);
        }
        setTrainedFeatures(features);
        
        if (response.data.confusion_matrix_fig) {
          setConfusionMatrix(JSON.parse(response.data.confusion_matrix_fig));
        }
        
        // Initialize prediction inputs
        const initialInputs = {};
        features.forEach(feature => {
          initialInputs[feature] = '';
        });
        setPredictionInputs(initialInputs);
        
        toast.success('Model trained successfully!');
      }, 500);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Training failed');
    } finally {
      setTimeout(() => {
        setTraining(false);
        setTrainingProgress(0);
      }, 1000);
    }
  };

  const handleDownloadModel = () => {
    if (modelFilename) {
      window.open(`http://localhost:5000/api/download/model/${sessionId}`, '_blank');
      toast.success('Model download started!');
    }
  };

  const handlePredictionInputChange = (feature, value) => {
    setPredictionInputs(prev => ({
      ...prev,
      [feature]: value
    }));
  };

  const handlePredict = async () => {
    // Validate inputs
    const emptyFields = trainedFeatures.filter(f => !predictionInputs[f]);
    if (emptyFields.length > 0) {
      toast.error(`Please fill in all fields: ${emptyFields.join(', ')}`);
      return;
    }

    setPredicting(true);
    setPredictionResult(null);

    try {
      const response = await makePrediction({
        session_id: sessionId,
        input_data: predictionInputs
      });

      setPredictionResult(response.data);
      toast.success('Prediction completed!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Prediction failed');
    } finally {
      setPredicting(false);
    }
  };

  const renderClassificationMetrics = () => {
    if (!report) return null;

    const accuracy = report.accuracy || 0;
    const f1Score = report.F1_Score || report['weighted avg']?.['f1-score'] || 0;
    const precision = report['weighted avg']?.precision || 0;
    const recall = report['weighted avg']?.recall || 0;
    const cvScore = report.Cross_Validation_Score || 0;
    const rocAuc = report.ROC_AUC || null;

    return (
      <div className="metrics-grid">
        <MetricCard 
          title="Accuracy" 
          value={(accuracy * 100).toFixed(2) + '%'} 
          color="#10B981"
          icon="🎯"
        />
        <MetricCard 
          title="F1 Score" 
          value={f1Score.toFixed(4)} 
          color="#3B82F6"
          icon="⚡"
        />
        <MetricCard 
          title="Precision" 
          value={precision.toFixed(4)} 
          color="#8B5CF6"
          icon="🔍"
        />
        <MetricCard 
          title="Recall" 
          value={recall.toFixed(4)} 
          color="#EC4899"
          icon="📊"
        />
        <MetricCard 
          title="Cross-Val Score" 
          value={cvScore.toFixed(4)} 
          color="#F59E0B"
          icon="🔄"
        />
        {rocAuc && (
          <MetricCard 
            title="ROC AUC" 
            value={rocAuc.toFixed(4)} 
            color="#06B6D4"
            icon="📈"
          />
        )}
      </div>
    );
  };

  const renderRegressionMetrics = () => {
    if (!report) return null;

    const r2 = report['R² Score'] || 0;
    const mse = report['Mean Squared Error'] || 0;
    const mae = report['Mean Absolute Error'] || 0;
    const rmse = Math.sqrt(mse);
    const cvScore = report.Cross_Validation_Score || 0;

    return (
      <div className="metrics-grid">
        <MetricCard 
          title="R² Score" 
          value={r2.toFixed(4)} 
          color="#10B981"
          icon="🎯"
          subtitle={(r2 * 100).toFixed(1) + '% variance explained'}
        />
        <MetricCard 
          title="RMSE" 
          value={rmse.toFixed(4)} 
          color="#3B82F6"
          icon="📉"
          subtitle="Root Mean Squared Error"
        />
        <MetricCard 
          title="MAE" 
          value={mae.toFixed(4)} 
          color="#8B5CF6"
          icon="📊"
          subtitle="Mean Absolute Error"
        />
        <MetricCard 
          title="MSE" 
          value={mse.toFixed(4)} 
          color="#EC4899"
          icon="⚠️"
          subtitle="Mean Squared Error"
        />
        <MetricCard 
          title="Cross-Val Score" 
          value={cvScore.toFixed(4)} 
          color="#F59E0B"
          icon="🔄"
        />
      </div>
    );
  };

  const renderFeatureImportance = () => {
    if (!report || !report.Feature_Importance) return null;

    const topFeatures = report.Feature_Importance.slice(0, 10);

    return (
      <div className="feature-importance-section">
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '600', 
          marginBottom: '1.5rem',
          color: 'var(--text-primary)'
        }}>
          🔝 Top 10 Important Features
        </h3>
        <div className="feature-importance-list">
          {topFeatures.map((feature, idx) => (
            <div key={idx} className="feature-importance-item">
              <div className="feature-info">
                <span className="feature-rank">#{idx + 1}</span>
                <span className="feature-name">{feature.Feature}</span>
              </div>
              <div className="feature-bar-container">
                <div 
                  className="feature-bar"
                  style={{ 
                    width: `${(feature.Importance / topFeatures[0].Importance) * 100}%`,
                    background: `linear-gradient(90deg, #667eea ${idx * 10}%, #764ba2 100%)`
                  }}
                />
                <span className="feature-value">{feature.Importance.toFixed(4)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPredictionInterface = () => {
    if (!trainedFeatures.length) {
      return (
        <div className="content-card">
          <div className="alert alert-info">
            <FaMagic />
            <div>
              <strong>No Model Trained Yet</strong>
              <br />
              <span style={{ fontSize: '13px', opacity: 0.8 }}>
                Please train a model first to use the prediction interface
              </span>
            </div>
          </div>
        </div>
      );
    }

    // Get column info for better input types
    const getColumnInfo = (featureName) => {
      if (!summary || !summary.column_info) return null;
      return summary.column_info.find(col => col.name === featureName);
    };

    return (
      <div className="content-card slide-in">
        <div className="card-header">
          <h2 className="card-title">
            <FaMagic style={{ color: '#8B5CF6' }} />
            Make Predictions
          </h2>
          <p className="card-subtitle">
            Enter values for each feature to get a prediction from your trained model
          </p>
        </div>

        <div className="prediction-form">
          <div className="prediction-inputs-grid">
            {trainedFeatures.map((feature, idx) => {
              const colInfo = getColumnInfo(feature);
              const isNumeric = colInfo && (colInfo.dtype === 'int64' || colInfo.dtype === 'float64');
              
              return (
                <div key={idx} className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📊</span>
                    {feature}
                  </label>
                  <input
                    type={isNumeric ? 'number' : 'text'}
                    step={isNumeric && colInfo.dtype === 'float64' ? 'any' : '1'}
                    className="form-input"
                    value={predictionInputs[feature] || ''}
                    onChange={(e) => handlePredictionInputChange(feature, e.target.value)}
                    placeholder={`Enter ${feature}${colInfo ? ` (${colInfo.dtype})` : ''}`}
                  />
                  {colInfo && (
                    <p className="form-hint">
                      Type: {colInfo.dtype} • Unique values: {colInfo.unique}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <button 
            onClick={handlePredict}
            className="btn btn-primary btn-large"
            disabled={predicting}
          >
            <FaMagic className={predicting ? 'spin' : ''} />
            {predicting ? 'Predicting...' : 'Predict'}
          </button>
        </div>

        {predictionResult && (
          <div className="prediction-result">
            <h3 className="section-title">
              <FaCheckCircle style={{ color: '#10B981' }} />
              Prediction Result
            </h3>
            <div className="result-card">
              <div className="result-label">Predicted {targetColumn}:</div>
              <div className="result-value">
                {Array.isArray(predictionResult.prediction) 
                  ? predictionResult.prediction[0] 
                  : predictionResult.prediction}
              </div>
            </div>
            {predictionResult.probability && (
              <div className="probability-section">
                <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  Prediction Probabilities
                </h4>
                <div className="probability-bars">
                  {Object.entries(predictionResult.probability).map(([label, prob], idx) => (
                    <div key={idx} className="probability-item">
                      <div className="probability-label">{label}</div>
                      <div className="probability-bar-container">
                        <div 
                          className="probability-bar"
                          style={{ 
                            width: `${prob * 100}%`,
                            backgroundColor: prob > 0.5 ? '#10B981' : '#6B7280'
                          }}
                        />
                        <span className="probability-value">{(prob * 100).toFixed(2)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Report Generator - Show after prediction */}
        {predictionResult && (
          <ReportGenerator sessionId={sessionId} />
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Training Configuration Card */}
      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">
            <FaRobot />
            Machine Learning Model Training
          </h2>
          <p className="card-subtitle">
            Configure and train your machine learning model with automatic task detection
          </p>
        </div>

        <div className="ml-form">
          {/* Target Column Selection */}
          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">🎲</span>
              Target Column (What to predict?)
            </label>
            <select 
              className="form-select" 
              value={targetColumn} 
              onChange={(e) => setTargetColumn(e.target.value)}
            >
              <option value="">-- Select Target Column --</option>
              {allColumns.map((col, idx) => (
                <option key={idx} value={col.name}>
                  {col.name} ({col.dtype}, {col.unique} unique values)
                </option>
              ))}
            </select>
            <p className="form-hint">
              Select the column you want to predict. Task type will be detected automatically.
            </p>
          </div>

          {/* Auto-detected Task Type */}
          {targetColumn && taskType && (
            <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
              <FaCheckCircle />
              <div>
                <strong>Auto-detected Task Type</strong>
                <br />
                <span style={{ fontSize: '14px' }}>{getTaskTypeLabel()}</span>
              </div>
            </div>
          )}

          {/* Model Configuration */}
          {taskType && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">🤖</span>
                    Model Algorithm
                  </label>
                  <select 
                    className="form-select" 
                    value={modelType} 
                    onChange={(e) => setModelType(e.target.value)}
                  >
                    {taskType === 'regression' ? (
                      <>
                        <option value="RandomForestRegressor">Random Forest Regressor</option>
                        <option value="LinearRegression">Linear Regression</option>
                        <option value="XGBRegressor">XGBoost Regressor</option>
                        <option value="DecisionTreeRegressor">Decision Tree Regressor</option>
                        <option value="SVR">Support Vector Regressor</option>
                      </>
                    ) : (
                      <>
                        <option value="RandomForestClassifier">Random Forest Classifier</option>
                        <option value="LogisticRegression">Logistic Regression</option>
                        <option value="XGBClassifier">XGBoost Classifier</option>
                        <option value="DecisionTreeClassifier">Decision Tree Classifier</option>
                        <option value="SVC">Support Vector Classifier</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">✂️</span>
                    Test Set Size: {(testSize * 100).toFixed(0)}%
                  </label>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="0.4" 
                    step="0.05"
                    value={testSize}
                    onChange={(e) => setTestSize(parseFloat(e.target.value))}
                    className="form-range"
                  />
                  <div className="split-info">
                    <span className="split-label">Train: {((1 - testSize) * 100).toFixed(0)}%</span>
                    <span className="split-label">Test: {(testSize * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* Hyperparameter Tuning */}
              <div className="form-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={tuneParams}
                    onChange={(e) => setTuneParams(e.target.checked)}
                    className="form-checkbox"
                  />
                  <span className="checkbox-text">
                    <FaCog style={{ marginRight: '8px' }} />
                    Enable Hyperparameter Tuning (GridSearchCV)
                  </span>
                </label>
                <p className="form-hint" style={{ marginLeft: '28px' }}>
                  {tuneParams 
                    ? '⚠️ This will take longer but may improve model performance'
                    : 'Use default parameters for faster training'}
                </p>
              </div>

              {/* Train Button */}
              <button 
                onClick={handleTrain} 
                className="btn btn-primary btn-large"
                disabled={training || !targetColumn}
              >
                <FaCog className={training ? 'spin' : ''} />
                {training ? `Training... ${trainingProgress}%` : 'Train Model'}
              </button>

              {/* Training Progress Bar */}
              {training && (
                <div className="progress-container">
                  <div 
                    className="progress-bar"
                    style={{ width: `${trainingProgress}%` }}
                  />
                  <span className="progress-text">{trainingProgress}%</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Results Section with Tabs */}
      {report && (
        <>
          {/* Tab Navigation */}
          <div className="tabs-container">
            <button
              className={`tab-button ${activeTab === 'training' ? 'active' : ''}`}
              onClick={() => setActiveTab('training')}
            >
              <FaChartBar />
              Training Results
            </button>
            <button
              className={`tab-button ${activeTab === 'prediction' ? 'active' : ''}`}
              onClick={() => setActiveTab('prediction')}
            >
              <FaMagic />
              Make Predictions
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'training' ? (
            <div className="content-card slide-in">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h2 className="card-title">
                      <FaCheckCircle style={{ color: '#10B981' }} />
                      Model Performance Report
                    </h2>
                    <p className="card-subtitle">
                      {modelType} trained on {targetColumn} • Test Size: {(testSize * 100).toFixed(0)}%
                    </p>
                  </div>
                  <button 
                    onClick={handleDownloadModel}
                    className="btn btn-secondary"
                  >
                    <FaDownload />
                    Download Model
                  </button>
                </div>
              </div>
              
              {/* Metrics Section */}
              <div className="metrics-section">
                <h3 className="section-title">
                  <FaChartBar />
                  Performance Metrics
                </h3>
                {taskType === 'regression' ? renderRegressionMetrics() : renderClassificationMetrics()}
              </div>

              {/* Confusion Matrix */}
              {confusionMatrix && (
                <div className="visualization-section">
                  <h3 className="section-title">Confusion Matrix</h3>
                  <Plot
                    data={confusionMatrix.data}
                    layout={{
                      ...confusionMatrix.layout,
                      paper_bgcolor: 'transparent',
                      plot_bgcolor: 'transparent',
                      font: { color: '#E5E7EB' }
                    }}
                    config={{ responsive: true }}
                    style={{ width: '100%', height: '500px' }}
                  />
                </div>
              )}

              {/* Feature Importance */}
              {renderFeatureImportance()}

              {/* Model Info */}
              {modelFilename && (
                <div className="alert alert-success">
                  <FaCheckCircle />
                  <div>
                    <strong>Model Saved Successfully</strong>
                    <br />
                    <span style={{ fontSize: '13px', opacity: 0.8 }}>
                      Filename: {modelFilename} • You can download and use this model for predictions
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            renderPredictionInterface()
          )}
        </>
      )}
    </div>
  );
}

// Metric Card Component
function MetricCard({ title, value, color, icon, subtitle }) {
  return (
    <div className="metric-card">
      <div className="metric-icon" style={{ backgroundColor: color + '20', color: color }}>
        {icon}
      </div>
      <div className="metric-content">
        <div className="metric-title">{title}</div>
        <div className="metric-value" style={{ color: color }}>{value}</div>
        {subtitle && <div className="metric-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
}

export default MachineLearning;
