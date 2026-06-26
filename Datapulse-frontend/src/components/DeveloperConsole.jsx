import React, { useState } from 'react';
import { executeCode } from '../services/api';
import toast from 'react-hot-toast';
import { FaTerminal, FaPlay, FaPlus, FaTrash, FaUpload } from 'react-icons/fa';

function DeveloperConsole({ sessionId }) {
  const [cells, setCells] = useState([
    { id: 1, code: '# Write your Python code here\n# Use "df" to access your dataset\n\ndf.head()', output: null, executing: false }
  ]);
  const [cellCounter, setCellCounter] = useState(2);
  const [secondDataset, setSecondDataset] = useState(null);

  const addCell = () => {
    setCells([...cells, { 
      id: cellCounter, 
      code: '', 
      output: null, 
      executing: false 
    }]);
    setCellCounter(cellCounter + 1);
  };

  const deleteCell = (id) => {
    if (cells.length > 1) {
      setCells(cells.filter(cell => cell.id !== id));
    } else {
      toast.error('You must have at least one cell');
    }
  };

  const updateCellCode = (id, code) => {
    setCells(cells.map(cell => 
      cell.id === id ? { ...cell, code } : cell
    ));
  };

  const executeCell = async (id) => {
    const cell = cells.find(c => c.id === id);
    if (!cell || !cell.code.trim()) {
      toast.error('Cell is empty');
      return;
    }

    // Set executing state
    setCells(cells.map(c => 
      c.id === id ? { ...c, executing: true } : c
    ));

    try {
      const response = await executeCode({ 
        session_id: sessionId, 
        code: cell.code 
      });
      
      setCells(cells.map(c => 
        c.id === id ? { ...c, output: response.data, executing: false } : c
      ));
      
      if (response.data.success) {
        toast.success('Cell executed successfully!');
      } else {
        toast.error('Execution failed');
      }
    } catch (error) {
      setCells(cells.map(c => 
        c.id === id ? { 
          ...c, 
          output: { success: false, error: error.response?.data?.error || 'Execution error' },
          executing: false 
        } : c
      ));
      toast.error('Execution error');
    }
  };

  const runAllCells = () => {
    cells.forEach(cell => {
      if (cell.code.trim()) {
        executeCell(cell.id);
      }
    });
  };

  const clearAllCells = () => {
    setCells([{ 
      id: 1, 
      code: '', 
      output: null, 
      executing: false 
    }]);
    setCellCounter(2);
  };

  const handleSecondDatasetUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('session_id', sessionId);
      
      fetch('http://localhost:5000/api/upload_secondary', {
        method: 'POST',
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          setSecondDataset(data);
          toast.success('Second dataset uploaded!');
        })
        .catch(err => {
          toast.error('Upload failed');
        });
    }
  };

  const handleKeyDown = (e, id) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const cell = cells.find(c => c.id === id);
      const newCode = cell.code.substring(0, start) + '    ' + cell.code.substring(end);
      updateCellCode(id, newCode);
      
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    } else if (e.ctrlKey && e.key === 'Enter') {
      executeCell(id);
    }
  };

  return (
    <div className="console-container">
      {/* Header */}
      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">
            <FaTerminal />
            Developer Console
          </h2>
          <p className="card-subtitle">
            Interactive Python notebook environment - execute code directly on your dataset
          </p>
        </div>

        {/* Info */}
        <div className="console-info">
          <h3>💡 How to Use</h3>
          <ul>
            <li><strong>df</strong> - Your main dataset (current cleaned data)</li>
            <li><strong>other_df</strong> - Second dataset (if uploaded)</li>
            <li><strong>pd</strong> - Pandas library</li>
            <li><strong>np</strong> - NumPy library</li>
            <li><strong>Ctrl + Enter</strong> - Execute current cell</li>
            <li><strong>Tab</strong> - Insert indentation</li>
          </ul>
        </div>

        {/* Upload Second Dataset */}
        <div className="dataset-upload-section">
          <h3 className="upload-section-title">
            <FaUpload /> Upload Second Dataset (Optional)
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
            Upload a second dataset for merge, concatenate, or comparison operations
          </p>
          <input 
            type="file" 
            accept=".csv,.xlsx,.xls"
            onChange={handleSecondDatasetUpload}
            style={{ marginBottom: 'var(--spacing-md)' }}
          />
          {secondDataset && (
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              ✓ Loaded: {secondDataset.filename} ({secondDataset.rows} rows × {secondDataset.columns} columns)
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="console-controls">
          <button onClick={addCell} className="btn btn-primary">
            <FaPlus />
            Add Cell
          </button>
          <button onClick={runAllCells} className="btn btn-secondary">
            <FaPlay />
            Run All
          </button>
          <button onClick={clearAllCells} className="btn btn-outline">
            <FaTrash />
            Clear All
          </button>
        </div>
      </div>

      {/* Cells */}
      <div className="console-cells">
        {cells.map((cell, index) => (
          <div key={cell.id} className="console-cell fade-in">
            {/* Cell Header */}
            <div className="console-cell-header">
              <span className="console-cell-label">In [{index + 1}]:</span>
              <button 
                className="console-cell-delete"
                onClick={() => deleteCell(cell.id)}
                title="Delete cell"
              >
                <FaTrash />
              </button>
            </div>

            {/* Code Input */}
            <textarea 
              className="form-textarea" 
              rows={8}
              value={cell.code} 
              onChange={(e) => updateCellCode(cell.id, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, cell.id)}
              placeholder="# Write your Python code here..."
              style={{ 
                fontFamily: 'Fira Code, monospace',
                fontSize: '14px',
                lineHeight: '1.5'
              }}
            />

            {/* Cell Actions */}
            <div className="console-cell-actions">
              <button 
                onClick={() => executeCell(cell.id)}
                className="btn btn-primary"
                disabled={cell.executing}
              >
                <FaPlay />
                {cell.executing ? 'Executing...' : 'Run Cell'}
              </button>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Ctrl + Enter to execute
              </span>
            </div>

            {/* Output */}
            {cell.output && (
              <div style={{ marginTop: 'var(--spacing-md)' }}>
                <div className="console-output-label">Out [{index + 1}]:</div>
                
                {cell.output.success ? (
                  <div>
                    {/* Text Output */}
                    {cell.output.output && (
                      <div className="console-output">
                        {cell.output.output}
                      </div>
                    )}
                    
                    {/* Result Output */}
                    {cell.output.result && (
                      <div className="code-output">
                        <div className="output-header">
                          <span className="output-type">{cell.output.result_type || 'Result'}</span>
                        </div>
                        <pre style={{ margin: 0, overflow: 'auto' }}>
                          {typeof cell.output.result === 'string' 
                            ? cell.output.result 
                            : JSON.stringify(cell.output.result, null, 2)}
                        </pre>
                        {cell.output.result_shape && (
                          <div style={{ 
                            marginTop: 'var(--spacing-sm)',
                            fontSize: '12px',
                            color: 'var(--text-muted)'
                          }}>
                            Shape: {cell.output.result_shape[0]} rows × {cell.output.result_shape[1]} columns
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="alert alert-error">
                    <span>❌</span>
                    <div style={{ flex: 1 }}>
                      <strong>Error:</strong>
                      <pre style={{ 
                        marginTop: 'var(--spacing-sm)',
                        fontSize: '13px',
                        overflow: 'auto'
                      }}>
                        {cell.output.error}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Examples */}
      <div className="content-card">
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: 'var(--spacing-md)' }}>
          💡 Quick Examples
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-md)' }}>
          <div style={{ background: 'var(--bg-tertiary)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)' }}>
            <strong>Merge datasets:</strong>
            <pre style={{ fontSize: '12px', marginTop: 'var(--spacing-sm)' }}>
{`merged = pd.merge(df, other_df, on='id')
merged.head()`}
            </pre>
          </div>
          <div style={{ background: 'var(--bg-tertiary)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)' }}>
            <strong>Concatenate:</strong>
            <pre style={{ fontSize: '12px', marginTop: 'var(--spacing-sm)' }}>
{`combined = pd.concat([df, other_df])
combined.shape`}
            </pre>
          </div>
          <div style={{ background: 'var(--bg-tertiary)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)' }}>
            <strong>Filter data:</strong>
            <pre style={{ fontSize: '12px', marginTop: 'var(--spacing-sm)' }}>
{`filtered = df[df['age'] > 25]
filtered.head()`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeveloperConsole;
