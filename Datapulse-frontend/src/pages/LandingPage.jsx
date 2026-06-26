import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import logo from '../assets/logo.jpeg';
import dashboardImg from '../assets/interface.png';

const API_URL = 'https://datapulse-backend-ojwl.onrender.com';

const CREDITS_KEY   = 'datapulse_credits';
const DEMO_MODE_KEY = 'datapulse_demo_mode';
const PROFILE_KEY   = 'datapulse_profile';

const getCredits  = () => { const s = localStorage.getItem(CREDITS_KEY); if (s === null) { localStorage.setItem(CREDITS_KEY,'5'); return 5; } return parseInt(s,10); };
const saveCredits = (n) => localStorage.setItem(CREDITS_KEY, String(n));
const isDemoMode  = () => localStorage.getItem(DEMO_MODE_KEY) === 'true';
const setDemoMode = (v) => localStorage.setItem(DEMO_MODE_KEY, String(v));

const DEFAULT_PROFILE = {
  name: 'Rakesh Kapilavayi',
  email: 'rakeshkapilavayi978@gmail.com',
  dob: '1999-08-15',
  password: '',
};
const getProfile  = () => { try { const s = localStorage.getItem(PROFILE_KEY); return s ? { ...DEFAULT_PROFILE, ...JSON.parse(s) } : DEFAULT_PROFILE; } catch { return DEFAULT_PROFILE; } };
const saveProfile = (p) => localStorage.setItem(PROFILE_KEY, JSON.stringify(p));

const FEATURE_ROUTES = {
  cleaning:      { tab: 'manual',   label: 'Data Cleaning'  },
  ml:            { tab: 'ml',       label: 'ML Studio'       },
  visualization: { tab: 'viz',      label: 'Visualizations'  },
  insights:      { tab: 'insights', label: 'AI Insights'     },
  downloads:     { tab: null,       label: 'Downloadables'   },
};

function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0,2).toUpperCase();
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROFILE DROPDOWN  —  Linear / Vercel / Notion style
// ═══════════════════════════════════════════════════════════════════════════════
function ProfileDropdown({ onClose }) {
  const [profile, setProfile] = useState(getProfile());
  const [view, setView]       = useState('menu');   // 'menu' | 'edit' | 'security'
  const [form, setForm]       = useState(getProfile());
  const [showPw, setShowPw]   = useState(false);
  const [savedMsg, setSaved]  = useState('');
  const dropRef = useRef(null);

  useEffect(() => {
    function onDown(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [onClose]);

  const doSave = () => {
    saveProfile(form);
    setProfile(form);
    setSaved('Saved successfully');
    setTimeout(() => { setSaved(''); setView('menu'); }, 1500);
  };

  const fmtDob = (d) => {
    if (!d) return '—';
    try { return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }); }
    catch { return d; }
  };

  const initials = getInitials(profile.name);
  const credits  = getCredits();

  return (
    <div className="pd-shell" ref={dropRef}>

      {/* ── MAIN MENU ── */}
      {view === 'menu' && (
        <>
          {/* Header: avatar + name + email */}
          <div className="pd-header">
            <div className="pd-avatar">{initials}</div>
            <div className="pd-header-text">
              <p className="pd-name">{profile.name || 'Your Name'}</p>
              <p className="pd-email">{profile.email || 'your@email.com'}</p>
            </div>
          </div>

          {/* Plan badge row */}
          <div className="pd-meta-row">
            <span className="pd-plan-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              Explorer Plan
            </span>
            <span className="pd-credits-badge">
              ⚡ {credits} credits
            </span>
          </div>

          <div className="pd-sep"/>

          {/* Navigation items */}
          <div className="pd-nav">

            <button className="pd-nav-item" onClick={() => { setForm(profile); setView('edit'); }}>
              <span className="pd-nav-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <div className="pd-nav-text">
                <span className="pd-nav-label">Profile</span>
                <span className="pd-nav-desc">Name, email, date of birth</span>
              </div>
              <svg className="pd-nav-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>

            <button className="pd-nav-item" onClick={() => { setForm(profile); setView('security'); }}>
              <span className="pd-nav-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
              <div className="pd-nav-text">
                <span className="pd-nav-label">Security</span>
                <span className="pd-nav-desc">Password · account access</span>
              </div>
              <svg className="pd-nav-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>

            <button className="pd-nav-item">
              <span className="pd-nav-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              </span>
              <div className="pd-nav-text">
                <span className="pd-nav-label">Billing</span>
                <span className="pd-nav-desc">Upgrade · buy more credits</span>
              </div>
              <svg className="pd-nav-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>

          </div>

          <div className="pd-sep"/>

          {/* Sign out row */}
          <div className="pd-footer">
            <button className="pd-signout" onClick={onClose}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign out
            </button>
            <span className="pd-version">v1.0.0</span>
          </div>
        </>
      )}

      {/* ── EDIT PROFILE ── */}
      {view === 'edit' && (
        <>
          <div className="pd-subheader">
            <button className="pd-back" onClick={() => setView('menu')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="pd-subheader-title">Edit profile</span>
          </div>

          <div className="pd-sep"/>

          <div className="pd-body">
            {/* Inline avatar preview */}
            <div className="pd-avatar-preview">
              <div className="pd-avatar pd-avatar--lg">{getInitials(form.name || '')}</div>
              <div>
                <p className="pd-avatar-name">{form.name || 'Your name'}</p>
                <p className="pd-avatar-hint">Avatar auto-generated from initials</p>
              </div>
            </div>

            <div className="pd-field">
              <label className="pd-label">Full name</label>
              <input className="pd-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Rakesh Kapilavayi"/>
            </div>

            <div className="pd-field">
              <label className="pd-label">Email address</label>
              <input className="pd-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com"/>
            </div>

            <div className="pd-field">
              <label className="pd-label">Date of birth</label>
              <input className="pd-input" type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})}/>
              {form.dob && <span className="pd-field-note">{fmtDob(form.dob)}</span>}
            </div>

            {savedMsg
              ? <div className="pd-saved"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>{savedMsg}</div>
              : <div className="pd-actions"><button className="pd-btn-cancel" onClick={() => setView('menu')}>Cancel</button><button className="pd-btn-save" onClick={doSave}>Save changes</button></div>
            }
          </div>
        </>
      )}

      {/* ── SECURITY ── */}
      {view === 'security' && (
        <>
          <div className="pd-subheader">
            <button className="pd-back" onClick={() => setView('menu')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="pd-subheader-title">Security</span>
          </div>

          <div className="pd-sep"/>

          <div className="pd-body">
            {/* Read-only info */}
            <div className="pd-info-block">
              <div className="pd-info-row">
                <span className="pd-info-key">Email</span>
                <span className="pd-info-val">{profile.email || '—'}</span>
              </div>
              <div className="pd-info-row">
                <span className="pd-info-key">Date of birth</span>
                <span className="pd-info-val">{fmtDob(profile.dob)}</span>
              </div>
              <div className="pd-info-row">
                <span className="pd-info-key">Plan</span>
                <span className="pd-info-val pd-info-plan-tag">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  Explorer
                </span>
              </div>
            </div>

            <div className="pd-sep" style={{marginBottom:'1rem'}}/>

            <div className="pd-field">
              <label className="pd-label">New password</label>
              <div className="pd-pw-wrap">
                <input
                  className="pd-input"
                  type={showPw ? 'text' : 'password'}
                  value={form.password || ''}
                  onChange={e => setForm({...form, password: e.target.value})}
                  placeholder="Set a new password"
                />
                <button type="button" className="pd-pw-eye" onClick={() => setShowPw(v => !v)}>
                  {showPw
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {/* strength meter */}
              {(form.password || '').length > 0 && (() => {
                const l = form.password.length;
                const lvl = l < 6 ? 1 : l < 10 ? 2 : l < 14 ? 3 : 4;
                const cols = ['','#EF4444','#F59E0B','#5B8DEE','#10B981'];
                const lbls = ['','Weak','Fair','Good','Strong'];
                return (
                  <div className="pd-strength">
                    <div className="pd-strength-track">
                      {[1,2,3,4].map(i => <div key={i} className="pd-strength-seg" style={{background: i<=lvl ? cols[lvl] : '#E5E7EB'}}/>)}
                    </div>
                    <span className="pd-strength-lbl" style={{color: cols[lvl]}}>{lbls[lvl]}</span>
                  </div>
                );
              })()}
            </div>

            {savedMsg
              ? <div className="pd-saved"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>{savedMsg}</div>
              : <div className="pd-actions"><button className="pd-btn-cancel" onClick={() => setView('menu')}>Cancel</button><button className="pd-btn-save" onClick={doSave}>Update password</button></div>
            }
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEARN MORE PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function LearnMorePage({ onBack }) {
  const segments = [
    {icon:'🧹',color:'#5B8DEE',bg:'#EFF6FF',title:'Data Cleaning',subtitle:'Office admins · Accountants · NGO volunteers · Back-office staff',desc:"You work with Excel or CSV files every day — attendance sheets, expense reports, survey exports, student records. The data arrives messy: blank cells, duplicate rows, inconsistent date formats, random spelling variations. You just need clean, trustworthy data you can hand off or upload to your ERP without embarrassment.",who:['Office admins, clerks & back-office staff — fix spelling, remove duplicates, merge Excel files','Accountants & finance assistants — clean sales/expense sheets before uploading to Tally/ERP','College staff, librarians & NGO volunteers — fix messy survey or student data to share with others'],needs:['Remove nulls & blank cells per column','De-duplicate rows instantly','Standardize data types & date formats','Simple filters & column-level control','Export clean file back to CSV / Excel']},
    {icon:'📊',color:'#10B981',bg:'#ECFDF5',title:'Visualizations & Dashboards',subtitle:'Business owners · Managers · Teachers · NGO field officers',desc:"Numbers in a spreadsheet mean nothing in a meeting. You need charts you can show on a projector or paste into a report — sales trends for your coaching centre, student performance graphs for your HoD, survey results for a donor presentation. No coding, no Tableau license needed.",who:['Business owners & managers of small shops / institutes — sales trends, admissions, attendance charts','Teachers, college HoDs & training institutes — student performance graphs, attendance trends','NGO and government field officers — visualize survey results, demographics, impact metrics'],needs:['Auto-generated bar, line & pie charts','Correlation heatmaps & scatter plots','Distribution histograms','Simple dashboards you can show in meetings','Download plots as PNG with one click']},
    {icon:'🤖',color:'#8B5CF6',bg:'#F5F3FF',title:'ML Predictions',subtitle:'Data analysts · Startup founders · Operations & marketing teams',desc:"You think in terms of \"What will happen next?\" — next month's sales, which customer will churn, which lead will convert. You want a baseline model trained on your CSV without writing 200 lines of sklearn boilerplate. Upload, pick a target column, click Train, get metrics and live predictions.",who:['Data analysts & junior data scientists — quick baseline models from CSV without writing all EDA code','Startup founders & product managers — churn prediction, lead conversion prediction, revenue forecast','Operations & marketing teams in SMEs — predict next month sales, which customer will buy, risk scores'],needs:['One-click model training (classification & regression)','Automated hyperparameter tuning','Feature importance ranking','Live "predict for new row" interface','Download trained model as .pkl file']},
    {icon:'💡',color:'#F59E0B',bg:'#FFFBEB',title:'Insights & Analysis',subtitle:'Managers · Consultants · Researchers · Startup founders',desc:"You ask \"Why is this happening?\" not \"How do I code this?\". You need the story of your data — which category is growing fastest, which branch has anomalies, what drives revenue, where the outliers are. DataPulse turns statistics into plain-language findings you can act on immediately.",who:['Managers, business heads & startup founders — top drivers, anomalies, key segments, actionable points','Consultants & data analysts — summary stats, correlations, distribution shapes, outliers','Researchers, policy leads & NGO directors — group comparisons, trends over time, significant differences'],needs:['Statistical: mean, median, variance, correlations explained simply','Outlier & anomaly detection with plain-language explanations','Business insights: "Category A is growing fastest", "These 10 customers give 60% revenue"','Key driver & trend identification','Actionable recommendations']},
  ];
  const tableRows = [
    {need:'Cleaning only',icon:'🧹',color:'#5B8DEE',users:'Clerks, admins, accountants, NGO volunteers',features:'Missing-value handling, duplicate removal, type fixing, Excel export'},
    {need:'Visuals',icon:'📊',color:'#10B981',users:'Managers, teachers, small business owners, NGOs',features:'Auto-EDA dashboards, charts, filters, easy PDF/PNG export'},
    {need:'Predictions (ML)',icon:'🤖',color:'#8B5CF6',users:'Analysts, data scientists, startup founders',features:'Auto model training, metrics, simple "predict for new row" interface'},
    {need:'Insights',icon:'💡',color:'#F59E0B',users:'Founders, managers, consultants, researchers',features:'Narrative insights, key drivers, anomalies, recommendations'},
  ];
  const plans = [
    {title:'Explorer',price:'0',credits:5,featured:false,desc:'Perfect for individuals exploring their data.',features:['5 dataset uploads','Up to 10k rows','Basic Data Cleaning','Core Visualizations','Basic ML Models','Quick Summary Insights']},
    {title:'Analyst',price:'799',credits:100,featured:true,desc:'For teams and serious data analysts.',features:['100 dataset uploads','Up to 200k rows','Priority Processing','Full Cleaning Suite + Reports','Advanced EDA (Heatmaps, Outliers)','All ML Models (XGBoost, Random Forest)','Export Cleaned Data + Model Files']},
    {title:'Architect',price:'1499',credits:999,featured:false,desc:'Unlimited power for organisations.',features:['Unlimited uploads','Unlimited rows','Custom Cleaning Rules','Full ML Suite + Tuning Dashboard','Custom LLM Insight Templates','Priority Support & SLA']},
  ];
  useEffect(() => { window.scrollTo(0,0); }, []);
  return (
    <div className="learn-more-page">
      <div className="lm-topbar"><button className="lm-back-btn" onClick={onBack}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>Back to Home</button><div className="lm-topbar-brand"><img src={logo} alt="DataPulse" style={{width:32,height:32,borderRadius:8,objectFit:'cover'}}/><span>DataPulse</span></div></div>
      <div className="lm-hero"><h1>Who is DataPulse For?</h1><p>Four types of data problems. One tool. No code required.</p></div>
      <div className="lm-body">
        <div className="lm-segments">{segments.map((s) => (<div key={s.title} className="lm-card" style={{'--card-accent':s.color}}><div className="lm-card-header" style={{background:s.bg}}><span className="lm-card-icon">{s.icon}</span><div><h2 style={{color:s.color}}>{s.title}</h2><p className="lm-card-subtitle">{s.subtitle}</p></div></div><div className="lm-card-body"><p className="lm-card-desc">{s.desc}</p><div className="lm-card-cols"><div className="lm-card-col"><h4>👥 Who they are</h4><ul>{s.who.map((w,i)=><li key={i}>{w}</li>)}</ul></div><div className="lm-card-col"><h4>✅ What they need</h4><ul>{s.needs.map((n,i)=><li key={i}>{n}</li>)}</ul></div></div></div></div>))}</div>
        <div className="lm-section"><h2 className="lm-section-title">DataPulse at a Glance</h2><p className="lm-section-sub">Match your role to the features that matter most to you.</p><div className="lm-table-wrap"><table className="lm-table"><thead><tr><th>What you need</th><th>Typical roles</th><th>Key features in DataPulse</th></tr></thead><tbody>{tableRows.map(r=>(<tr key={r.need}><td><span className="lm-table-need" style={{color:r.color}}>{r.icon} {r.need}</span></td><td>{r.users}</td><td>{r.features}</td></tr>))}</tbody></table></div></div>
        <div className="lm-section lm-pricing-section"><h2 className="lm-section-title">Simple, Credit-Based Pricing</h2><p className="lm-section-sub">Each dataset upload uses 1 credit. Start free, upgrade when you need more.</p><div className="lm-pricing-grid">{plans.map(plan=>(<div key={plan.title} className={`lm-pricing-card ${plan.featured?'featured':''}`}>{plan.featured&&<div className="lm-popular-badge">Most Popular</div>}<div className="lm-plan-header"><h3>{plan.title}</h3><div className="lm-plan-price"><span className="lm-currency">₹</span><span className="lm-amount">{plan.price}</span><span className="lm-period">/month</span></div><p className="lm-plan-desc">{plan.desc}</p><div className="lm-credits-chip">⚡ {plan.credits===999?'Unlimited':plan.credits} credits</div></div><ul className="lm-plan-features">{plan.features.map(f=><li key={f}><span>✓</span>{f}</li>)}</ul><button className={`lm-plan-btn ${plan.featured?'featured':''}`}>{plan.price==='0'?'Get Started Free':'Choose Plan'}</button></div>))}</div></div>
        <div className="lm-cta"><h2>Ready to try it?</h2><p>No sign-up required. Upload your first dataset free.</p><button className="btn btn-primary lm-cta-btn" onClick={onBack}>← Back to DataPulse</button></div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN LANDING PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function LandingPage() {
  const navigate = useNavigate();
  const [activeSection,  setActiveSection]  = useState('home');
  const [isScrolled,     setIsScrolled]      = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen]  = useState(false);
  const [credits,        setCreditsState]    = useState(getCredits());
  const [demoMode,       setDemoModeState]   = useState(isDemoMode());
  const [showPricing,    setShowPricing]     = useState(false);
  const [featureModal,   setFeatureModal]    = useState(null);
  const [downloadModal,  setDownloadModal]   = useState(false);
  const [showLearnMore,  setShowLearnMore]   = useState(false);
  const [showProfile,    setShowProfile]     = useState(false);
  const [profile,        setProfileState]    = useState(getProfile());

  useEffect(() => {
    const onScroll = () => { setIsScrolled(window.scrollY > 50); updateActiveSection(); };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { if (!showProfile) setProfileState(getProfile()); }, [showProfile]);

  const updateActiveSection = () => {
    const ids = ['home','demo','upcoming','contact']; const pos = window.scrollY + 200;
    for (const id of ids) { const el = document.getElementById(id); if (el && pos >= el.offsetTop && pos < el.offsetTop + el.offsetHeight) { setActiveSection(id); break; } }
  };
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) { const nh = document.querySelector('.navbar')?.offsetHeight||0; window.scrollTo({top: el.offsetTop - nh, behavior:'smooth'}); }
    setMobileMenuOpen(false);
  };

  // ── FIX: unified upload handler using /api/upload ──
  const handleFileUpload = async (file, targetTab) => {
    const cur = getCredits(); if (cur <= 0 && !demoMode) { setShowPricing(true); return; }
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv','xls','xlsx'].includes(ext)) { alert('Please upload a CSV, XLS, or XLSX file'); return; }
    try {
      const fd = new FormData(); fd.append('file', file);
      // ✅ FIXED: was '/upload', now correctly '/api/upload'
      const res = await fetch(`${API_URL}/api/upload`, {method:'POST', body:fd});
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      if (!demoMode) { const nc = cur - 1; saveCredits(nc); setCreditsState(nc); }
      navigate('/app', { state: { sessionId:data.session_id, filename:data.filename, summary:data.summary, initialTab:targetTab||'summary' } });
    } catch(e) { console.error(e); alert('Upload failed. Please try again.'); }
  };

  const activateDemoMode   = () => { setDemoMode(true);  setDemoModeState(true);  setShowPricing(false); };
  const deactivateDemoMode = () => { setDemoMode(false); setDemoModeState(false); };

  if (showLearnMore) return <LearnMorePage onBack={() => { setShowLearnMore(false); window.scrollTo(0,0); }} />;

  const initials = getInitials(profile.name);

  return (
    <div className="landing-page">

      {/* ── Navbar ── */}
      <nav className={`navbar ${isScrolled?'scrolled':''}`}>
        <div className="nav-container">
          <div className="nav-brand">
            <img src={logo} alt="DataPulse" className="logo-image"/>
            <span className="logo-text">DataPulse</span>
          </div>
          <div className={`nav-links ${mobileMenuOpen?'active':''}`}>
            {[{id:'home',emoji:'🏠',label:'Home'},{id:'demo',emoji:'🎯',label:'Demo'},{id:'upcoming',emoji:'🚀',label:'Upcoming'},{id:'contact',emoji:'📧',label:'Contact'}].map(({id,emoji,label}) => (
              <a key={id} href={`#${id}`} className={`nav-link ${activeSection===id?'active':''}`} onClick={e=>{e.preventDefault();scrollTo(id)}}>{emoji} {label}</a>
            ))}
            <a href="https://github.com/rakeshkapilavayi" target="_blank" rel="noopener noreferrer" className="nav-link github-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </a>
          </div>
          <div className="nav-right">
            {demoMode && (<button className="demo-pill-cancel" onClick={deactivateDemoMode} title="Click to exit Demo Mode">🎬 Demo Mode <span className="demo-pill-x">✕</span></button>)}
            <div className={`credits-badge ${credits===0&&!demoMode?'zero':''}`} onClick={()=>credits===0&&!demoMode&&setShowPricing(true)} title={demoMode?'Demo Mode — unlimited uploads':'Credits remaining'}>
              <span>⚡</span><span className="credits-count">{demoMode?'∞':credits}</span><span className="credits-label">credits</span>
            </div>

            {/* ── Profile trigger ── */}
            <div className="pd-trigger-wrap">
              <button className={`pd-trigger ${showProfile?'pd-trigger--open':''}`} onClick={() => setShowProfile(v => !v)} aria-label="Account menu">
                <div className="pd-trigger-avatar">{initials}</div>
                <svg className="pd-trigger-caret" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points={showProfile?'18 15 12 9 6 15':'6 9 12 15 18 9'}/>
                </svg>
              </button>
              {showProfile && <ProfileDropdown onClose={() => setShowProfile(false)} />}
            </div>

            <button className="mobile-menu-btn" onClick={()=>setMobileMenuOpen(!mobileMenuOpen)}><span/><span/><span/></button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero" id="home">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge"><span className="badge-dot"/>✨ From complexity to clarity</div>
            <h1 className="hero-title">Automate Data Insights</h1>
            <p className="hero-subtitle">Upload CSV/Excel files for automated machine learning, exploratory data analysis, and powerful visualizations. Transform your data into actionable business insights.</p>
            <div className="hero-buttons">
              <button className="btn-get-started" onClick={()=>scrollTo('demo')}>
                <div className="gs-main"><div className="gs-arrow-circle"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div><span className="gs-label">Get Started</span></div>
                <span className="gs-hint">End-to-end: Clean → Visualize → Detect Outliers → Model → Insights</span>
              </button>
              <button className="btn btn-secondary" onClick={()=>setShowLearnMore(true)}>Learn More</button>
            </div>
          </div>
          <div className="hero-visual"><img src={dashboardImg} alt="DataPulse Dashboard" className="hero-dashboard-img"/></div>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section className="features-row-section">
        <div className="features-row-container">
          {[{key:'cleaning',icon:'📊',label:'Data Cleaning',desc:'Clean, preprocess, and handle missing data'},{key:'ml',icon:'🤖',label:'ML Models',desc:'Build and train machine learning models'},{key:'visualization',icon:'📈',label:'Visualizations',desc:'Generate advanced charts and graphs'},{key:'insights',icon:'💡',label:'AI Insights',desc:'Gain smart, AI-driven business insights'},{key:'downloads',icon:'📥',label:'Downloadables',desc:'Download reports and model outputs'}].map(({key,icon,label,desc},index) => (
            <div key={key} className="feat-card" style={{animationDelay:`${index*0.3}s`}} onClick={()=>key==='downloads'?setDownloadModal(true):setFeatureModal(key)} title={label}>
              <div className="feat-card-icon">{icon}</div><div className="feat-card-body"><div className="feat-card-label">{label}</div><div className="feat-card-desc">{desc}</div></div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Demo ── */}
      <section className="demo-section" id="demo">
        <div className="section-container">
          <div className="section-header"><h2 className="section-title">Try It Now</h2><p className="section-subtitle">Upload your dataset and start analysing in seconds</p></div>
          <CreditsInfo credits={credits} demoMode={demoMode} onBuyCredits={()=>setShowPricing(true)} onExitDemoMode={deactivateDemoMode}/>
          <FileUploadBox onFileUpload={f=>handleFileUpload(f,'summary')} credits={credits} demoMode={demoMode}/>
        </div>
      </section>

      {/* ── Upcoming ── */}
      <section className="upcoming-section" id="upcoming">
        <div className="section-container">
          <div className="section-header">
            <div className="upcoming-badge"><span className="badge-pulse"/><span>Coming Soon</span></div>
            <h2 className="section-title gradient-text">Upcoming Features</h2>
            <p className="section-subtitle" style={{color:'rgba(255,255,255,0.8)'}}>Exciting new capabilities on the roadmap to make DataPulse even more powerful</p>
          </div>
          <div className="upcoming-grid">
            {[{icon:'🤖',cls:'pulse-ai-icon',badgeCls:'upcoming-badge-new',badge:'New AI',title:'Pulse AI Assistant',eta:'Q2 2026',featured:true,desc:'Your intelligent data companion powered by advanced AI. Pulse AI guides you through every step of analysis with natural language conversations.',feats:['Natural language data queries','Intelligent cleaning recommendations','Interactive guidance & tutorials','Context-aware suggestions']},{icon:'✨',cls:'insights-icon',badgeCls:'upcoming-badge-ai',badge:'AI Powered',title:'AI-Enhanced Insights',eta:'Q3 2026',featured:false,desc:'Transform raw statistical insights into comprehensive, easy-to-understand analysis with business context and actionable recommendations.',feats:['Deep pattern analysis','Business-focused interpretations','Automated report generation','Strategic recommendations']},{icon:'🗄️',cls:'database-icon',badgeCls:'upcoming-badge-pro',badge:'Pro Feature',title:'Database Integration',eta:'Q4 2026',featured:false,desc:'Connect directly to PostgreSQL, MySQL, MongoDB, and more. Query, analyse, and visualize without manual exports.',feats:['Direct SQL database connections','PostgreSQL, MySQL, SQLite support','NoSQL support (MongoDB etc.)','Custom query builder']}].map(item=>(
              <div key={item.title} className={`upcoming-card ${item.featured?'featured-upcoming':''}`}>
                <div className="upcoming-header"><div className={`upcoming-icon ${item.cls}`}><span className="icon-glow">{item.icon}</span></div><div className={item.badgeCls}>{item.badge}</div></div>
                <h3 className="upcoming-title">{item.title}</h3><p className="upcoming-description">{item.desc}</p>
                <div className="upcoming-features-list">{item.feats.map(f=><div key={f} className="upcoming-feature-item"><span className="feature-check">✓</span><span>{f}</span></div>)}</div>
                <div className="upcoming-eta"><span className="eta-icon">🗓️</span><span>Expected: {item.eta}</span></div>
              </div>
            ))}
          </div>
          <div className="upcoming-newsletter"><div className="newsletter-content"><h3>Stay Updated!</h3><p>Get notified when these features launch</p></div><div className="newsletter-form"><input type="email" placeholder="Enter your email" className="newsletter-input"/><button className="newsletter-button">Notify Me →</button></div></div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer" id="contact">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo"><img src={logo} alt="DataPulse" className="footer-logo-image"/><span className="logo-text">DataPulse</span></div>
              <p className="footer-tagline">Created by Rakesh Kapilavayi — Aspiring Data Scientist specialising in Python, SQL, Data Cleaning, EDA, Visualization, and Machine Learning.</p>
              <div className="footer-social">
                <a href="mailto:rakeshkapilavayi978@gmail.com" className="social-link"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6" stroke="white" strokeWidth="2" fill="none"/></svg></a>
                <a href="https://www.linkedin.com/in/rakesh-kapilavayi-48b9a0342/" target="_blank" rel="noopener noreferrer" className="social-link"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a>
                <a href="https://github.com/rakeshkapilavayi" target="_blank" rel="noopener noreferrer" className="social-link"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a>
              </div>
            </div>
            <div className="footer-links-group">
              <div className="footer-column"><h4>Product</h4><ul><li><a href="#demo" onClick={e=>{e.preventDefault();scrollTo('demo')}}>Try DataPulse</a></li><li><a href="#learn" onClick={e=>{e.preventDefault();setShowLearnMore(true)}}>Learn More</a></li><li><a href="#upcoming" onClick={e=>{e.preventDefault();scrollTo('upcoming')}}>Upcoming Features</a></li></ul></div>
              <div className="footer-column"><h4>Contact</h4><ul><li><a href="mailto:rakeshkapilavayi978@gmail.com">rakeshkapilavayi978@gmail.com</a></li><li><a href="https://github.com/rakeshkapilavayi" target="_blank" rel="noopener noreferrer">GitHub: rakeshkapilavayi</a></li><li><a href="https://www.linkedin.com/in/rakesh-kapilavayi-48b9a0342/" target="_blank" rel="noopener noreferrer">LinkedIn: Rakesh Kapilavayi</a></li></ul></div>
            </div>
          </div>
          <div className="footer-bottom"><p>© 2026 DataPulse. All rights reserved.</p></div>
        </div>
      </footer>

      {featureModal&&(<FeatureUploadModal featureKey={featureModal} credits={credits} demoMode={demoMode} onClose={()=>setFeatureModal(null)} onUpload={f=>{setFeatureModal(null);handleFileUpload(f,FEATURE_ROUTES[featureModal].tab);}} onBuyCredits={()=>{setFeatureModal(null);setShowPricing(true);}}/>)}
      {downloadModal&&(<DownloadablesModal onClose={()=>setDownloadModal(false)} onGetStarted={()=>{setDownloadModal(false);scrollTo('demo');}}/>)}
      {showPricing&&(<PricingModal onClose={()=>setShowPricing(false)} onActivateDemoMode={activateDemoMode}/>)}
    </div>
  );
}

function CreditsInfo({credits,demoMode,onBuyCredits,onExitDemoMode}){if(demoMode)return(<div className="credits-info-bar demo"><span>🎬</span><span><strong>Demo Mode active</strong> — unlimited uploads, credits not consumed. Perfect for client presentations.</span><button className="exit-demo-btn" onClick={onExitDemoMode}>Exit Demo Mode ✕</button></div>);if(credits>0)return(<div className="credits-info-bar"><span>⚡</span><span>You have <strong>{credits} credit{credits!==1?'s':''}</strong> remaining. Each dataset upload uses 1 credit.</span></div>);return(<div className="credits-info-bar empty"><span>⚠️</span><span>You've used all your free credits.</span><button className="credits-buy-btn" onClick={onBuyCredits}>Upgrade Now →</button></div>);}

function FeatureUploadModal({featureKey,credits,demoMode,onClose,onUpload,onBuyCredits}){const feature=FEATURE_ROUTES[featureKey];const[drag,setDrag]=useState(false);const ref=React.useRef(null);const canUpload=credits>0||demoMode;const INFO={cleaning:{emoji:'🧹',color:'#5B8DEE',desc:'Choose Manual Cleaning (per-column control) or Auto Cleaning (one-click). Handle missing values, remove duplicates, cap outliers.',steps:['Upload CSV / XLS / XLSX','Choose Manual or Auto Clean tab','Apply cleaning operations','Download cleaned dataset']},ml:{emoji:'🤖',color:'#8B5CF6',desc:'Train classification or regression models in one click. Pick a target column, choose an algorithm, get metrics, feature importance, and live predictions.',steps:['Upload your dataset','Select target column & algorithm','Train the model','View metrics & make predictions','Download the .pkl model file']},visualization:{emoji:'📈',color:'#10B981',desc:'Instantly generate interactive Plotly charts — histograms, bar charts, correlation heatmaps, scatter plots. Use the Custom Chart Builder for bespoke visuals.',steps:['Upload your dataset','Auto-generated charts appear','Use the Custom Chart Builder','Hover chart → 📷 to download']},insights:{emoji:'💡',color:'#F59E0B',desc:'Get automated statistical insights — data quality scores, key findings, outlier alerts, and actionable recommendations generated instantly.',steps:['Upload your dataset','Statistical analysis runs automatically','Review key findings & recommendations','Act on data quality advice']}};const info=INFO[featureKey];const onDrag=e=>{e.preventDefault();e.stopPropagation();setDrag(e.type==='dragenter'||e.type==='dragover');};const onDrop=e=>{e.preventDefault();e.stopPropagation();setDrag(false);if(e.dataTransfer.files?.[0])onUpload(e.dataTransfer.files[0]);};return(<div className="modal-overlay" onClick={onClose}><div className="feature-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={onClose}>✕</button><div className="feature-modal-header"><span className="feature-modal-emoji">{info.emoji}</span><div><h2 className="feature-modal-title" style={{color:info.color}}>{feature.label}</h2><p className="feature-modal-desc">{info.desc}</p></div></div><div className="feature-modal-steps"><h4>How it works</h4><ol className="steps-list">{info.steps.map((s,i)=><li key={i}><span className="step-num" style={{background:info.color}}>{i+1}</span>{s}</li>)}</ol></div>{canUpload?(<><div className="credits-notice">{demoMode?'🎬 Demo Mode — credits not consumed':`⚡ ${credits} credit${credits!==1?'s':''} remaining — uploading uses 1 credit`}</div><div className={`feature-dropzone ${drag?'active':''}`} onDragEnter={onDrag} onDragLeave={onDrag} onDragOver={onDrag} onDrop={onDrop} onClick={()=>ref.current?.click()}><div className="dropzone-icon-big">{info.emoji}</div><p className="dropzone-title">Drop your dataset here</p><p className="dropzone-hint">CSV, XLS, XLSX · click or drag & drop</p><input ref={ref} type="file" accept=".csv,.xls,.xlsx" onChange={e=>{if(e.target.files?.[0])onUpload(e.target.files[0])}} style={{display:'none'}}/></div></>):(<div className="credits-gate"><p>⚠️ You've run out of free credits. Upgrade to continue.</p><button className="btn btn-primary" onClick={onBuyCredits}>View Plans →</button></div>)}</div></div>);}

function DownloadablesModal({onClose,onGetStarted}){const items=[{icon:'📷',title:'Visualisation Plots',badge:'Visualizations tab',desc:'Hover over any chart → click the 📷 camera icon in the top-right Plotly toolbar → downloads as PNG.'},{icon:'🗂️',title:'Cleaned Dataset (CSV)',badge:'Navbar → Download Data',desc:'After cleaning, click Download Data in the top navbar to get your fully cleaned CSV file.'},{icon:'🤖',title:'ML Model (.pkl)',badge:'ML Studio tab',desc:'After training, click Download Model to save the serialised scikit-learn pipeline as a pickle file.'},{icon:'📄',title:'End-to-End Report (PDF & Word)',badge:'ML Studio → Report Generator',desc:'In ML Studio, scroll to Report Generator after training. Click Download PDF or Download Word for a full report.'}];return(<div className="modal-overlay" onClick={onClose}><div className="downloads-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={onClose}>✕</button><div className="downloads-modal-header"><span>📥</span><div><h2>What Can You Download?</h2><p>Everything you create in DataPulse is exportable</p></div></div><div className="downloads-grid">{items.map(({icon,title,desc,badge})=>(<div className="download-item-card" key={title}><div className="download-item-icon">{icon}</div><div><div className="download-item-title">{title}</div><span className="download-item-badge">{badge}</span><p className="download-item-desc">{desc}</p></div></div>))}</div><div style={{textAlign:'center',marginTop:'2rem'}}><button className="btn btn-primary" onClick={onGetStarted}>Upload Dataset to Get Started →</button></div></div></div>);}

function PricingModal({onClose,onActivateDemoMode}){const plans=[{title:'Explorer',price:'0',credits:5,featured:false,desc:'Perfect for individuals exploring their data.',features:['5 dataset uploads','Up to 10k rows','Basic Data Cleaning','Core Visualizations','Basic ML Models','Quick Summary Insights']},{title:'Analyst',price:'799',credits:100,featured:true,desc:'For teams and serious data analysts.',features:['100 dataset uploads','Up to 200k rows','Priority Processing','Full Cleaning Suite + Reports','Advanced EDA (Heatmaps, Outliers)','All ML Models (XGBoost, Random Forest)','Export Cleaned Data + Model Files']},{title:'Architect',price:'1499',credits:999,featured:false,desc:'Unlimited power for organisations.',features:['Unlimited uploads','Unlimited rows','Custom Cleaning Rules','Full ML Suite + Tuning Dashboard','Custom LLM Insight Templates','Priority Support & SLA']}];return(<div className="modal-overlay" onClick={onClose}><div className="pricing-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={onClose}>✕</button><div className="pricing-modal-header"><h2>You've used all your free credits</h2><p>Upgrade to continue — or use <strong>Demo Mode</strong> for client presentations</p></div><div className="demo-mode-banner" onClick={onActivateDemoMode}><div className="dmb-icon">🎬</div><div className="dmb-content"><strong>Enable Demo Mode — Free for client presentations</strong><p>Show DataPulse to clients without consuming credits. Uploads work normally, nothing is charged.</p></div><button className="dmb-btn" onClick={e=>{e.stopPropagation();onActivateDemoMode();}}>Activate →</button></div><div className="pricing-divider"><span>or upgrade a plan</span></div><div className="pricing-grid">{plans.map(plan=>(<div key={plan.title} className={`pricing-card ${plan.featured?'featured':''}`}>{plan.featured&&<div className="popular-badge">Most Popular</div>}<div className="pricing-header"><h3 className="pricing-title">{plan.title}</h3><div className="pricing-price"><span className="currency">₹</span><span className="amount">{plan.price}</span><span className="period">/month</span></div><p className="pricing-description">{plan.desc}</p><div className="pricing-credits-badge"><span>⚡</span><span>{plan.credits===999?'Unlimited':plan.credits} credits</span></div></div><ul className="pricing-features">{plan.features.map(f=><li key={f}>✓ {f}</li>)}</ul><button className={`pricing-button ${plan.featured?'primary':''}`}>{plan.price==='0'?'Current Plan':'Get Started'}</button></div>))}</div></div></div>);}

// ═══════════════════════════════════════════════════════════════════════════════
// FILE UPLOAD BOX  —  ✅ FIXED: uses /api/upload (was /upload → caused 404)
// ═══════════════════════════════════════════════════════════════════════════════
function FileUploadBox({onFileUpload,credits,demoMode}){
  const[drag,setDrag]=useState(false);
  const[uploading,setUploading]=useState(false);
  const[progress,setProgress]=useState(0);
  const[stage,setStage]=useState('');
  const[fname,setFname]=useState('');
  const ref=React.useRef(null);
  const canUpload=credits>0||demoMode;

  const onDrag=e=>{e.preventDefault();e.stopPropagation();setDrag(e.type==='dragenter'||e.type==='dragover');};
  const onDrop=async e=>{e.preventDefault();e.stopPropagation();setDrag(false);if(e.dataTransfer.files?.[0])await upload(e.dataTransfer.files[0]);};
  const onChange=async e=>{e.preventDefault();if(e.target.files?.[0])await upload(e.target.files[0]);};

  const upload=async(file)=>{
    if(!canUpload)return;
    const ext=file.name.split('.').pop().toLowerCase();
    if(!['csv','xls','xlsx'].includes(ext)){alert('Please upload a CSV, XLS, or XLSX file');return;}
    setFname(file.name);
    setUploading(true);
    setProgress(0);
    setStage('uploading');
    try{
      const t=setInterval(()=>setProgress(p=>{if(p>=85){clearInterval(t);return 85;}return p+12;}),200);
      const fd=new FormData();
      fd.append('file',file);
      // ✅ FIXED: corrected endpoint from /upload to /api/upload
      const res=await fetch(`${API_URL}/api/upload`,{method:'POST',body:fd});
      clearInterval(t);
      if(!res.ok)throw new Error('Upload failed');
      setProgress(95);
      setStage('processing');
      await new Promise(r=>setTimeout(r,600));
      setProgress(100);
      setStage('complete');
      setTimeout(()=>onFileUpload(file),600);
    }catch(e){
      console.error(e);
      setUploading(false);
      setProgress(0);
      setStage('');
      setFname('');
      alert('Upload failed. Please try again.');
    }
  };

  return(
    <div className="upload-section">
      <h3>Upload Your Dataset</h3>
      <div
        className={`upload-box ${drag?'drag-active':''} ${uploading?'uploading':''} ${!canUpload?'disabled':''}`}
        onClick={()=>!uploading&&canUpload&&ref.current?.click()}
        onDragEnter={onDrag} onDragLeave={onDrag} onDragOver={onDrag} onDrop={onDrop}
        style={{cursor:uploading||!canUpload?'not-allowed':'pointer',minHeight:uploading?'450px':'auto'}}
      >
        {uploading?(
          <div className="upload-progress-container">
            <div className="circular-progress">
              <svg width="160" height="160">
                <circle stroke="#E5E7EB" strokeWidth="12" fill="transparent" r="70" cx="80" cy="80"/>
                <circle stroke={stage==='complete'?'#10B981':'url(#grad)'} strokeWidth="12" fill="transparent" r="70" cx="80" cy="80" strokeLinecap="round" style={{strokeDasharray:`${2*Math.PI*70}`,strokeDashoffset:`${2*Math.PI*70*(1-progress/100)}`,transition:'stroke-dashoffset .5s ease,stroke .3s ease',transform:'rotate(-90deg)',transformOrigin:'50% 50%'}}/>
                <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#5B8DEE"/><stop offset="100%" stopColor="#8B5CF6"/></linearGradient></defs>
              </svg>
              <div className="progress-text">
                {stage==='complete'
                  ?<div className="success-checkmark"><svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div>
                  :<><div className="progress-number">{progress}%</div><div className="progress-label">{stage==='uploading'?'Uploading':'Processing'}</div></>
                }
              </div>
            </div>
            <div className="upload-file-info">
              <div className="file-icon">📊</div>
              <div className="file-details"><div className="file-name">{fname}</div></div>
            </div>
            <div className="upload-status">
              <h4 className="status-title">{stage==='uploading'&&'📤 Uploading...'}{stage==='processing'&&'⚙️ Processing...'}{stage==='complete'&&'✅ Complete!'}</h4>
              <p className="status-description">{stage==='uploading'&&'Transferring to our servers'}{stage==='processing'&&'Analysing structure & generating summary'}{stage==='complete'&&'Redirecting to dashboard...'}</p>
            </div>
            <div className="linear-progress">
              <div className="progress-track">
                <div className="progress-fill" style={{width:`${progress}%`,background:stage==='complete'?'linear-gradient(90deg,#10B981,#34D399)':'linear-gradient(90deg,#5B8DEE,#8B5CF6)'}}>
                  <div className="progress-shine"/>
                </div>
              </div>
              <div className="progress-details">
                <span className="progress-stage">{stage==='uploading'?'Step 1 of 2 — Uploading':stage==='processing'?'Step 2 of 2 — Processing':'Complete'}</span>
                <span className="progress-percent">{progress}%</span>
              </div>
            </div>
            {stage!=='complete'&&<div className="loading-spinner"><div className="spinner-dot"/><div className="spinner-dot"/><div className="spinner-dot"/></div>}
          </div>
        ):!canUpload?(
          <div style={{padding:'3rem 1rem',textAlign:'center'}}>
            <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🔒</div>
            <p style={{fontWeight:700,color:'#ef4444',fontSize:'1.125rem',marginBottom:'.5rem'}}>No credits remaining</p>
            <p style={{color:'#6b7280'}}>Please upgrade your plan to continue</p>
          </div>
        ):(
          <>
            <div className="upload-icon"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div>
            <h4>Drag & Drop your file here</h4>
            <p>or click to browse</p>
            <span className="file-types">CSV, XLS, XLSX supported</span>
          </>
        )}
        <input ref={ref} type="file" accept=".csv,.xls,.xlsx" onChange={onChange} style={{display:'none'}} disabled={uploading||!canUpload}/>
      </div>
    </div>
  );
}

export default LandingPage;
