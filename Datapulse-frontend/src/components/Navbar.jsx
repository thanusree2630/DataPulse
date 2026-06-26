import React from 'react';
import { FaDownload, FaHome, FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa';
import toast from 'react-hot-toast';
import logo from '../assets/logo.jpeg';

function Navbar({ filename, sessionId, onBackToLanding }) {
  const handleDownload = () => {
    if (sessionId) {
      window.open(`http://localhost:5000/api/download/${sessionId}`, '_blank');
      toast.success('Download started!');
    }
  };

  return (
    <nav className="navbar-modern">
      <div className="navbar-content">
        {/* Brand Section with Logo */}
        <div className="brand-section">
          <img src={logo} alt="DataPulse Logo" className="brand-logo" />
          <div className="brand-info">
            <h1 className="brand-name">DataPulse</h1>
            <p className="brand-tagline">From complexity to clarity</p>
          </div>
        </div>

        {/* Center Section - Current File */}
        {filename && (
          <div className="navbar-center">
            <div className="current-file-badge">
              <span className="file-icon">📄</span>
              <div className="file-details">
                <span className="file-label">Active Dataset</span>
                <span className="file-name">{filename}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions Section - REMOVED NEW UPLOAD BUTTON */}
        <div className="navbar-actions">
          {onBackToLanding && (
            <button onClick={onBackToLanding} className="nav-btn">
              <FaHome />
              <span>Home</span>
            </button>
          )}
          {sessionId && (
            <button onClick={handleDownload} className="nav-btn">
              <FaDownload />
              <span>Download Data</span>
            </button>
          )}
        </div>
      </div>

      {/* Footer Bar */}
      <div className="navbar-footer">
        <div className="footer-content">
          <div className="author-section">
            <span className="author-text">Created by <strong>Rakesh Kapilavayi</strong></span>
          </div>
          <div className="social-links">
            <a href="mailto:rakeshkapilavayi978@gmail.com" className="social-link" title="Email">
              <FaEnvelope />
            </a>
            <a href="https://www.linkedin.com/in/rakesh-kapilavayi-48b9a0342/" target="_blank" rel="noopener noreferrer" className="social-link" title="LinkedIn">
              <FaLinkedin />
            </a>
            <a href="https://github.com/rakeshkapilavayi" target="_blank" rel="noopener noreferrer" className="social-link" title="GitHub">
              <FaGithub />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
