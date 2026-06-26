import React, { useState } from 'react';
import { FaFileDownload, FaFilePdf, FaFileWord, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './ReportGenerator.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://datapulse-backend-ojwl.onrender.com/api';
// Routes in app.py:
//   GET /api/report/download/docx/<session_id>
//   GET /api/report/download/pdf/<session_id>

function ReportGenerator({ sessionId }) {
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const downloadReport = async (format) => {
    if (format === 'docx') setDownloadingDocx(true);
    else setDownloadingPdf(true);

    try {
      const url = `${API_URL}/report/download/${format}/${sessionId}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `ml_analysis_report_${sessionId}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);

      toast.success(`${format.toUpperCase()} report downloaded!`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error(`Failed to download: ${error.message}`);
    } finally {
      setTimeout(() => {
        setDownloadingDocx(false);
        setDownloadingPdf(false);
      }, 1000);
    }
  };

  return (
    <div className="report-generator">
      <div className="report-header">
        <div className="report-icon">
          <FaFileDownload />
        </div>
        <div>
          <h3 className="report-title">Download Comprehensive Report</h3>
          <p className="report-subtitle">
            Get a detailed document of your entire ML workflow
          </p>
        </div>
      </div>

      <div className="report-content-preview">
        <h4>Report Includes:</h4>
        <ul className="report-features">
          <li>✓ Dataset overview and statistics</li>
          <li>✓ All data cleaning operations performed</li>
          <li>✓ Outlier detection and treatment details</li>
          <li>✓ Model training configuration</li>
          <li>✓ Performance metrics and evaluation</li>
          <li>✓ Feature importance analysis</li>
          <li>✓ Example predictions with results</li>
          <li>✓ AI-generated insights and recommendations</li>
        </ul>
      </div>

      <div className="report-actions">
        <div className="download-buttons">
          <button
            className="btn btn-download btn-word"
            onClick={() => downloadReport('docx')}
            disabled={downloadingDocx}
          >
            {downloadingDocx ? (
              <>
                <FaSpinner className="spin" />
                Downloading...
              </>
            ) : (
              <>
                <FaFileWord />
                Download Word
              </>
            )}
          </button>

          <button
            className="btn btn-download btn-pdf"
            onClick={() => downloadReport('pdf')}
            disabled={downloadingPdf}
          >
            {downloadingPdf ? (
              <>
                <FaSpinner className="spin" />
                Downloading...
              </>
            ) : (
              <>
                <FaFilePdf />
                Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      <div className="report-info">
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '1rem' }}>
          💡 Click a button above to instantly download your complete analysis report
        </p>
      </div>
    </div>
  );
}

export default ReportGenerator;
