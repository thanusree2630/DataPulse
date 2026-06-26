import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt, FaFileAlt, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { uploadFile } from '../services/api';

function FileUpload({ onSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState(''); // 'uploading', 'processing', 'complete'

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setUploadProgress(0);
    setUploadStage('uploading');

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await uploadFile(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(95);
      setUploadStage('processing');

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUploadProgress(100);
      setUploadStage('complete');
      
      toast.success(`File "${file.name}" uploaded successfully!`);
      
      // Wait a moment before transitioning
      setTimeout(() => {
        onSuccess(response.data);
      }, 500);

    } catch (error) {
      setUploading(false);
      setUploadProgress(0);
      setUploadStage('');
      toast.error(error.response?.data?.error || 'Upload failed. Please try again.');
    }
  }, [onSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div style={{ maxWidth: '900px', margin: '4rem auto', padding: '2rem' }} className="fade-in">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="gradient-text" style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1rem' }}>
          Welcome to DataPulse
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
          Your intelligent data analysis companion. Upload your dataset to get started.
        </p>
      </div>

      <div
        {...getRootProps()}
        style={{
          background: 'var(--bg-card)',
          border: `3px dashed ${isDragActive ? 'var(--accent-green)' : uploading ? 'var(--primary-start)' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius-xl)',
          padding: '4rem 2rem',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s',
          transform: isDragActive ? 'scale(1.02)' : 'scale(1)',
          boxShadow: isDragActive ? 'var(--shadow-xl)' : 'var(--shadow-sm)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="upload-progress-container">
            {/* Progress Circle */}
            <div className="progress-circle">
              <svg width="120" height="120" className="progress-ring">
                <circle
                  className="progress-ring-circle-bg"
                  stroke="var(--border-color)"
                  strokeWidth="8"
                  fill="transparent"
                  r="52"
                  cx="60"
                  cy="60"
                />
                <circle
                  className="progress-ring-circle"
                  stroke="var(--primary-start)"
                  strokeWidth="8"
                  fill="transparent"
                  r="52"
                  cx="60"
                  cy="60"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 52}`,
                    strokeDashoffset: `${2 * Math.PI * 52 * (1 - uploadProgress / 100)}`,
                    transition: 'stroke-dashoffset 0.3s ease',
                  }}
                />
              </svg>
              <div className="progress-percentage">
                {uploadStage === 'complete' ? (
                  <FaCheckCircle style={{ fontSize: '2.5rem', color: 'var(--accent-green)' }} />
                ) : (
                  <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary-start)' }}>
                    {uploadProgress}%
                  </span>
                )}
              </div>
            </div>

            {/* Upload Stage Text */}
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ 
                fontSize: '1.5rem', 
                marginBottom: '0.5rem',
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {uploadStage === 'uploading' && 'Uploading your file...'}
                {uploadStage === 'processing' && 'Processing dataset...'}
                {uploadStage === 'complete' && 'Upload complete!'}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                {uploadStage === 'uploading' && 'Please wait while we upload your dataset'}
                {uploadStage === 'processing' && 'Analyzing your data structure'}
                {uploadStage === 'complete' && 'Redirecting to dashboard...'}
              </p>
            </div>

            {/* Animated Dots */}
            <div className="loading-dots" style={{ marginTop: '1rem' }}>
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>

            {/* Progress Bar (Alternative) */}
            <div className="progress-bar-container" style={{ marginTop: '2rem', width: '100%', maxWidth: '400px', margin: '2rem auto 0' }}>
              <div className="progress-bar-bg" style={{
                width: '100%',
                height: '8px',
                background: 'var(--border-color)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
              }}>
                <div className="progress-bar-fill" style={{
                  width: `${uploadProgress}%`,
                  height: '100%',
                  background: 'var(--gradient-primary)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.3s ease',
                }}></div>
              </div>
              <p style={{ 
                marginTop: '0.5rem', 
                fontSize: '0.85rem', 
                color: 'var(--text-muted)',
                display: 'flex',
                justifyContent: 'space-between',
              }}>
                <span>{uploadStage === 'uploading' ? 'Uploading' : uploadStage === 'processing' ? 'Processing' : 'Complete'}</span>
                <span>{uploadProgress}%</span>
              </p>
            </div>
          </div>
        ) : (
          <div>
            <FaCloudUploadAlt className="float" style={{ fontSize: '5rem', color: 'var(--primary-start)', marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>or click to browse</p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--bg-tertiary)',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem'
            }}>
              <FaFileAlt /> <span>Supports CSV, XLS, XLSX</span>
            </div>
          </div>
        )}
      </div>

      {!uploading && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginTop: '3rem'
        }}>
          {[
            { icon: '📊', title: 'Data Cleaning', desc: 'Automated and manual data cleaning options' },
            { icon: '📈', title: 'Visualizations', desc: 'Interactive charts and graphs' },
            { icon: '🤖', title: 'Machine Learning', desc: 'Train models with one click' },
            { icon: '💡', title: 'AI Insights', desc: 'Get intelligent recommendations' },
          ].map((feature, idx) => (
            <div key={idx} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{feature.icon}</div>
              <h4 style={{ marginBottom: '0.5rem' }}>{feature.title}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .upload-progress-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
        }

        .progress-circle {
          position: relative;
          width: 120px;
          height: 120px;
        }

        .progress-ring {
          transform: rotate(-90deg);
        }

        .progress-ring-circle {
          transition: stroke-dashoffset 0.5s ease;
          stroke-linecap: round;
        }

        .progress-percentage {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-dots {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          align-items: center;
        }

        .dot {
          width: 8px;
          height: 8px;
          background: var(--primary-start);
          border-radius: 50%;
          animation: dot-pulse 1.4s ease-in-out infinite;
        }

        .dot:nth-child(1) {
          animation-delay: 0s;
        }

        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes dot-pulse {
          0%, 80%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        .progress-bar-fill {
          position: relative;
          overflow: hidden;
        }

        .progress-bar-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

export default FileUpload;
