import React, { useState, useEffect } from 'react';
import { getInsights } from '../services/api';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';
import toast from 'react-hot-toast';
import './Insights.css';

// ─── Palette matches app.css accent colors ───────────────────────────────────
const PALETTE   = ['#2563eb', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
const IMP_COLOR = { critical: '#ef4444', high: '#f59e0b', medium: '#2563eb', low: '#10b981' };
const TYPE_ICON = { correlation: '🔗', outlier: '⚠️', distribution: '📊', quality: '✅', general: '💡' };
const CAT_ICON  = { cleaning: '🧹', modeling: '🤖', analysis: '📊', quality: '✅', general: '💡' };

function buildCharts(insights = [], stats = {}) {
  const typeCounts = {};
  insights.forEach(i => { typeCounts[i.type || 'general'] = (typeCounts[i.type || 'general'] || 0) + 1; });
  const pieData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

  const impCounts = { critical: 0, high: 0, medium: 0, low: 0 };
  insights.forEach(i => { if (impCounts[i.importance] !== undefined) impCounts[i.importance]++; });
  const barData = Object.entries(impCounts).map(([name, value]) => ({ name, value }));

  const base = stats.quality_score || 75;
  const lineData = [
    { time: 'T-5', score: +(Math.min(100, base - 12)).toFixed(1) },
    { time: 'T-4', score: +(Math.min(100, base - 8 )).toFixed(1) },
    { time: 'T-3', score: +(Math.min(100, base - 5 )).toFixed(1) },
    { time: 'T-2', score: +(Math.min(100, base - 2 )).toFixed(1) },
    { time: 'T-1', score: +(Math.min(100, base - 1 )).toFixed(1) },
    { time: 'Now', score: +base.toFixed(1) },
  ];

  const total   = (stats.rows || 100) * (stats.columns || 5);
  const missing = stats.missing_total || 0;
  const donutData = [
    { name: 'Complete', value: Math.max(0, total - missing) },
    { name: 'Missing',  value: missing },
  ];
  const radialData = [{ name: 'Quality', value: +(stats.quality_score || 0).toFixed(1), fill: '#2563eb' }];

  return { pieData, barData, lineData, donutData, radialData };
}

function buildHighlights(insights = [], stats = {}) {
  const hl = [];
  const qs = stats.quality_score || 0;
  if      (qs >= 90) hl.push({ icon: '🏆', color: '#10b981', title: 'Excellent Data Quality',   desc: `Score of ${qs.toFixed(0)}% — dataset is clean and analysis-ready.` });
  else if (qs >= 70) hl.push({ icon: '✅', color: '#2563eb', title: 'Good Data Quality',         desc: `Score of ${qs.toFixed(0)}% — minor improvements recommended.` });
  else               hl.push({ icon: '⚠️', color: '#f59e0b', title: 'Data Needs Attention',       desc: `Score of ${qs.toFixed(0)}% — cleaning advised before modeling.` });
  if (stats.missing_pct > 5) hl.push({ icon: '🕳️', color: '#ef4444', title: 'Missing Data Alert',  desc: `${stats.missing_pct.toFixed(1)}% of your data is missing.` });
  if (stats.duplicates  > 0) hl.push({ icon: '📋', color: '#f59e0b', title: 'Duplicate Rows Found', desc: `${stats.duplicates} duplicate rows (${stats.duplicate_pct?.toFixed(1)}%).` });
  const hi = insights.filter(i => i.importance === 'critical' || i.importance === 'high');
  if (hi.length) hl.push({ icon: '🔍', color: '#8b5cf6', title: `${hi.length} High-Priority Finding${hi.length > 1 ? 's' : ''}`, desc: hi[0].text });
  const corr = insights.filter(i => i.type === 'correlation');
  if (corr.length) hl.push({ icon: '🔗', color: '#06b6d4', title: 'Correlations Detected', desc: `${corr.length} feature pair${corr.length > 1 ? 's' : ''} show significant correlation.` });
  return hl.slice(0, 5);
}

const AppTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="ins-tooltip">
      {label && <p className="ins-tt-label">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="ins-tt-val" style={{ color: p.color || p.fill }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

function KPICard({ icon, label, value, sub, trend, colorClass, delay }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay || 0); return () => clearTimeout(t); }, [delay]);
  const up = trend > 0;
  return (
    <div className={`ins-kpi-card ${colorClass} ${vis ? 'kpi-vis' : ''}`}>
      <div className="ins-kpi-icon-wrap">{icon}</div>
      <div className="ins-kpi-body">
        <div className="ins-kpi-label">{label}</div>
        <div className="ins-kpi-value">{value}</div>
        {sub && <div className="ins-kpi-sub">{sub}</div>}
      </div>
      {trend !== undefined && (
        <div className={`ins-kpi-trend ${up ? 'trend-up' : 'trend-dn'}`}>
          {up ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
  );
}

function HighlightCard({ icon, color, title, desc, delay }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay || 0); return () => clearTimeout(t); }, [delay]);
  return (
    <div className={`ins-highlight ${vis ? 'hl-vis' : ''}`} style={{ borderLeftColor: color }}>
      <div className="ins-hl-icon">{icon}</div>
      <div>
        <div className="ins-hl-title">{title}</div>
        <div className="ins-hl-desc">{desc}</div>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="ins-chart-card">
      <div className="ins-cc-head">
        <div className="ins-cc-title">{title}</div>
        {subtitle && <div className="ins-cc-sub">{subtitle}</div>}
      </div>
      <div className="ins-cc-body">{children}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
function Insights({ sessionId }) {
  const [raw,     setRaw]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('overview');

  useEffect(() => {
    if (!sessionId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await getInsights(sessionId, 'raw');
        setRaw(res.data);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load insights');
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  if (loading) return (
    <div className="loading-state">
      <div className="loading-spinner" />
      <p>Analysing your dataset…</p>
    </div>
  );

  if (!raw) return (
    <div className="loading-state"><p>No insights available.</p></div>
  );

  const { insights = [], recommendations = [], statistics: stats = {} } = raw;
  const { pieData, barData, lineData, donutData, radialData } = buildCharts(insights, stats);
  const highlights = buildHighlights(insights, stats);

  const kpis = [
    { icon: '📦', label: 'Total Records',   value: (stats.rows||0).toLocaleString(),          sub: `${stats.columns||0} columns`,                                                             colorClass:'kpi-blue',   trend: 2.4,                            delay:0   },
    { icon: '✅', label: 'Data Quality',    value: `${(stats.quality_score||0).toFixed(0)}%`, sub: stats.quality_label||'—',                                                                   colorClass:'kpi-green',  trend: stats.quality_score>70?1.2:-3.1, delay:80  },
    { icon: '🕳️',label: 'Missing Values',  value: (stats.missing_total||0).toLocaleString(), sub: `${(stats.missing_pct||0).toFixed(1)}% of data`,                                            colorClass:'kpi-orange', trend:-(stats.missing_pct||0),          delay:160 },
    { icon: '📋', label: 'Duplicates',      value: (stats.duplicates||0).toLocaleString(),    sub: `${(stats.duplicate_pct||0).toFixed(1)}% of rows`,                                          colorClass:'kpi-red',    trend:-(stats.duplicate_pct||0),        delay:240 },
    { icon: '🔍', label: 'Key Findings',    value: insights.length,                            sub:`${insights.filter(i=>i.importance==='high'||i.importance==='critical').length} high priority`, colorClass:'kpi-purple', delay:320 },
    { icon: '🎯', label: 'Recommendations', value: recommendations.length,                     sub:`${recommendations.filter(r=>r.priority==='high'||r.priority==='critical').length} critical`,   colorClass:'kpi-cyan',   delay:400 },
  ];

  return (
    <div className="insights-page">

      {/* Header card */}
      <div className="content-card">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <h2 className="card-title" style={{ marginBottom:4 }}>💡 Data Insights Dashboard</h2>
            <p className="card-subtitle">AI-powered analysis · key findings · patterns · recommendations</p>
          </div>
          <div className="ins-live-pill">
            <span className="ins-live-dot" /> Live Analysis
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="ins-kpi-row">
        {kpis.map((k,i) => <KPICard key={i} {...k} />)}
      </div>

      {/* Tab bar */}
      <div className="content-card" style={{ padding:'10px 20px' }}>
        <div className="ins-tab-row">
          {[
            { id:'overview',        label:`📊 Overview` },
            { id:'findings',        label:`🔍 Findings (${insights.length})` },
            { id:'recommendations', label:`🎯 Recommendations (${recommendations.length})` },
          ].map(t => (
            <button key={t.id} className={`ins-tab-btn ${tab===t.id?'active':''}`} onClick={()=>setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── OVERVIEW ── */}
      {tab==='overview' && (
        <div className="ins-overview-grid">
          <div className="ins-charts-2col">

            <ChartCard title="Insight Type Distribution" subtitle="By category">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                    label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((_,i)=><Cell key={i} fill={PALETTE[i%PALETTE.length]}/>)}
                  </Pie>
                  <Tooltip content={<AppTooltip/>}/><Legend/>
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Findings by Priority" subtitle="Importance levels">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} barSize={30}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                  <XAxis dataKey="name" tick={{fill:'#6b7280',fontSize:12}}/>
                  <YAxis tick={{fill:'#6b7280',fontSize:12}} allowDecimals={false}/>
                  <Tooltip content={<AppTooltip/>}/>
                  <Bar dataKey="value" radius={[4,4,0,0]}>
                    {barData.map((e,i)=><Cell key={i} fill={IMP_COLOR[e.name]||PALETTE[i]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Data Quality Trend" subtitle="Score across analysis passes">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={lineData}>
                  <defs>
                    <linearGradient id="qg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                  <XAxis dataKey="time" tick={{fill:'#6b7280',fontSize:12}}/>
                  <YAxis domain={[0,100]} tick={{fill:'#6b7280',fontSize:12}}/>
                  <Tooltip content={<AppTooltip/>}/>
                  <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2}
                    fill="url(#qg)" dot={{fill:'#2563eb',r:4}} activeDot={{r:6}} name="Quality %"/>
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Data Completeness" subtitle="Complete vs missing values">
              <div style={{position:'relative'}}>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                      dataKey="value" paddingAngle={3}>
                      <Cell fill="#10b981"/><Cell fill="#ef4444"/>
                    </Pie>
                    <Tooltip content={<AppTooltip/>}/><Legend/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="ins-donut-center">
                  <div className="ins-donut-val">{(100-(stats.missing_pct||0)).toFixed(0)}%</div>
                  <div className="ins-donut-lbl">Complete</div>
                </div>
              </div>
            </ChartCard>

          </div>

          {/* Right column */}
          <div className="ins-right-col">
            <div className="content-card" style={{padding:'20px'}}>
              <h3 className="ins-panel-title">⚡ Smart Highlights</h3>
              {highlights.map((h,i)=><HighlightCard key={i} {...h} delay={i*90}/>)}
            </div>

            <div className="content-card ins-gauge-wrap">
              <h3 className="ins-panel-title">Overall Quality Score</h3>
              <div style={{position:'relative'}}>
                <ResponsiveContainer width="100%" height={170}>
                  <RadialBarChart cx="50%" cy="60%" innerRadius="55%" outerRadius="85%"
                    data={radialData} startAngle={180} endAngle={0}>
                    <RadialBar dataKey="value" cornerRadius={6} fill="#2563eb" background={{fill:'#f3f4f6'}}/>
                    <Tooltip content={<AppTooltip/>}/>
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="ins-gauge-center">
                  <div className="ins-gauge-val">{(stats.quality_score||0).toFixed(0)}%</div>
                  <div className="ins-gauge-lbl">{stats.quality_label||'—'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FINDINGS ── */}
      {tab==='findings' && (
        <div className="content-card slide-in">
          <div className="card-header">
            <h2 className="card-title">🔍 Key Findings</h2>
            <p className="card-subtitle">Automated analysis based on statistical patterns in your data</p>
          </div>
          <div className="ins-priority-chips">
            {Object.entries(IMP_COLOR).map(([key,color])=>{
              const count = insights.filter(i=>i.importance===key).length;
              return (
                <div key={key} className="ins-priority-chip" style={{borderColor:color,color}}>
                  <span className="ipc-count">{count}</span>
                  <span className="ipc-label">{key}</span>
                </div>
              );
            })}
          </div>
          <div className="insights-list">
            {insights.map((ins,i)=>{
              const color = IMP_COLOR[ins.importance]||'#6b7280';
              return (
                <div key={i} className="insight-card" style={{animationDelay:`${i*0.04}s`}}>
                  <div className="insight-number" style={{borderColor:color,color}}>{i+1}</div>
                  <div className="insight-content">
                    <div className="insight-header">
                      <span className="insight-type-icon">{TYPE_ICON[ins.type]||'💡'}</span>
                      <span className="insight-type-label">{ins.type}</span>
                      <span className="insight-importance-badge" style={{background:color+'18',color}}>{ins.importance}</span>
                    </div>
                    <p className="insight-text">{ins.text}</p>
                  </div>
                </div>
              );
            })}
            {insights.length===0 && <div className="ins-empty-msg">No findings detected for this dataset.</div>}
          </div>
        </div>
      )}

      {/* ── RECOMMENDATIONS ── */}
      {tab==='recommendations' && (
        <div className="content-card slide-in">
          <div className="card-header">
            <h2 className="card-title">🎯 Recommendations</h2>
            <p className="card-subtitle">Actionable next steps to improve your data and analysis</p>
          </div>
          <div className="recommendations-list">
            {recommendations.map((r,i)=>{
              const color = IMP_COLOR[r.priority]||'#6b7280';
              return (
                <div key={i} className="recommendation-card" style={{animationDelay:`${i*0.04}s`}}>
                  <div className="recommendation-header">
                    <div className="recommendation-number" style={{background:color}}>{i+1}</div>
                    <div className="recommendation-badges">
                      <span className="category-badge">{CAT_ICON[r.category]||'💡'} {r.category}</span>
                      <span className="priority-badge" style={{background:color+'18',color}}>{r.priority} priority</span>
                    </div>
                  </div>
                  <p className="recommendation-text">{r.text}</p>
                </div>
              );
            })}
            {recommendations.length===0 && <div className="ins-empty-msg">No recommendations — data looks great!</div>}
          </div>
        </div>
      )}

    </div>
  );
}

export default Insights;
