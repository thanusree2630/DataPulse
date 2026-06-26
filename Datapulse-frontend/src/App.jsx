import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import Navbar from './components/Navbar';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"   element={<LandingPage />} />
        <Route path="/app" element={<DashboardApp />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'white',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  );
}

function DashboardApp() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const initialState = location.state || {};

  const [sessionId,  setSessionId]  = useState(initialState.sessionId  || null);
  const [filename,   setFilename]   = useState(initialState.filename   || '');
  const [summary,    setSummary]    = useState(initialState.summary    || null);
  // Support deep-link to a specific tab from the landing page
  const [activeTab,  setActiveTab]  = useState(initialState.initialTab || 'summary');

  useEffect(() => {
    if (sessionId) {
      console.log('✅ Dashboard loaded with session:', sessionId);
    } else {
      console.log('📁 Waiting for file upload...');
    }
  }, [sessionId]);

  const handleUploadSuccess = (data) => {
    console.log('📤 Upload successful:', data);
    setSessionId(data.session_id);
    setFilename(data.filename);
    setSummary(data.summary);
    setActiveTab('summary');
  };

  const handleNewUpload = () => {
    setSessionId(null);
    setFilename('');
    setSummary(null);
    setActiveTab('summary');
  };

  const handleBackToLanding = () => navigate('/');

  return (
    <div className="app">
      <div className="app-content">
        <Navbar
          filename={filename}
          onNewUpload={handleNewUpload}
          sessionId={sessionId}
          onBackToLanding={handleBackToLanding}
        />

        <main className="main-content">
          {!sessionId ? (
            <FileUpload onSuccess={handleUploadSuccess} />
          ) : (
            <Dashboard
              sessionId={sessionId}
              filename={filename}
              summary={summary}
              setSummary={setSummary}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
