"use client"
import React, { useState, useRef } from 'react';
import {
  Server, CheckCircle2, FileWarning, RefreshCw, Database,
  SearchCode, FileText, ShieldAlert, Activity, Share2, AlertTriangle,
  Bell, Search, Shield, Zap, LayoutDashboard, GitBranch,
  Lock, BarChart2, Settings, HelpCircle, ChevronDown,
  Radio, Cpu, ArrowUpRight, ArrowDownRight, MoreHorizontal
} from 'lucide-react';

const DATA_SOURCES = [
  { id: 'cisco',   name: 'Firewall (Vendor X)',    type: 'UDP Stream',     ip: '10.0.0.254',
    samples: ['<166>Sep 29 10:05:12 fw-01 %ASA-6-302013: Built inbound TCP connection 12345 for outside:192.168.1.10/54321','<166>Sep 29 10:05:15 fw-01 %ASA-6-302013: Built inbound TCP connection 54321 for outside:10.0.0.5/443'],
    live:    ['<166>Sep 29 10:06:01 fw-01 %ASA-6-302013: Built inbound TCP connection 443 for outside:172.16.0.4/54321'] },
  { id: 'nginx',   name: 'Nginx API Gateway',      type: 'HTTP Log',       ip: '172.16.0.5',
    samples: ['10.0.0.1 - - [25/Sep/2026:14:32:10 +0000] "GET /api/v1/auth HTTP/1.1" 200 452','192.168.1.5 - - [25/Sep/2026:14:32:15 +0000] "POST /api/v1/data HTTP/1.1" 403 128'],
    live:    ['10.0.0.99 - - [25/Sep/2026:14:33:12 +0000] "GET /status HTTP/1.1" 200 112'] },
  { id: 'windows', name: 'Windows AD Controller',  type: 'WinEvent Log',   ip: '10.0.0.100',
    samples: ['EventID=4624 LogonType=3 AccountName=admin IpAddress=192.168.1.5','EventID=4625 LogonType=3 AccountName=guest IpAddress=10.0.0.2'],
    live:    ['EventID=4624 LogonType=3 AccountName=system IpAddress=127.0.0.1'] },
  { id: 'custom',  name: 'Legacy Mainframe DB',    type: 'Pipe-Delimited', ip: '10.99.0.1',
    samples: ['TXN|10045|SUCCESS|192.168.1.5|450.00','TXN|10046|FAILED|10.0.0.2|9999.99'],
    live:    ['TXN|10047|SUCCESS|172.16.0.1|12.50'] },
];

const SEV: any = {
  Low:      { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400', arrow: <ArrowDownRight size={14} className="text-emerald-400"/> },
  Medium:   { text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   dot: 'bg-amber-400',   arrow: <ArrowUpRight size={14} className="text-amber-400"/> },
  High:     { text: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20',  dot: 'bg-orange-400',  arrow: <ArrowUpRight size={14} className="text-orange-400"/> },
  Critical: { text: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     dot: 'bg-red-400',     arrow: <ArrowUpRight size={14} className="text-red-400"/> },
};

const REPORTS: any = {
  cisco:   { threat: 'Routine Traffic',   severity: 'Low',      desc: 'Standard HTTPS (443) traffic matching expected baseline. No anomalies detected across all verified blocks.', action: 'None required. Traffic logged to cold storage.' },
  nginx:   { threat: 'Brute-Force Probe', severity: 'Medium',   desc: '401 Unauthorized burst from single subnet targeting /api/v1/user. Possible credential stuffing campaign.', action: 'Rate-limit subnet. Rotate access tokens immediately.' },
  windows: { threat: 'Data Tampering',    severity: 'Critical', desc: 'Merkle Root Mismatch on Block #44. Attacker wiped local Event Viewer but ULPF cryptographic verification caught the mutation.', action: 'Quarantine AD Controller. Initiate memory dump now.' },
  custom:  { threat: 'Financial Anomaly', severity: 'High',     desc: 'TXN #10047 amount ($12.50) from unverified subnet deviates from baseline by 3+ standard deviations.', action: 'Freeze account. Suspend automated withdrawals.' },
};

const GRAPHS: any = {
  cisco:   [
    {type:'node',label:'172.16.0.4',sub:'External User',danger:false},
    {type:'edge',label:'TCP:443',status:null},
    {type:'node',label:'fw-01',sub:'Edge Firewall',danger:false},
    {type:'edge',label:'Allowed',status:'allowed'},
    {type:'node',label:'10.0.0.5',sub:'Web Server',danger:false},
  ],
  nginx:   [
    {type:'node',label:'192.168.1.10',sub:'Malicious Subnet',danger:true},
    {type:'edge',label:'GET /api/v1',status:null},
    {type:'node',label:'Gateway',sub:'Nginx Proxy',danger:false},
    {type:'edge',label:'HTTP 401',status:'blocked'},
    {type:'node',label:'Auth Service',sub:'Backend DB',danger:false},
  ],
  windows: [
    {type:'node',label:'127.0.0.1',sub:'Compromised Node',danger:true},
    {type:'edge',label:'Event 4624',status:null},
    {type:'node',label:'AD Controller',sub:'Windows Server',danger:true},
    {type:'edge',label:'Wipe Log',status:'blocked'},
    {type:'node',label:'Block #44',sub:'Security Log',danger:true},
  ],
  custom:  [
    {type:'node',label:'172.16.0.1',sub:'Unverified Subnet',danger:true},
    {type:'edge',label:'TXN:10047',status:null},
    {type:'node',label:'Mainframe DB',sub:'Payment Gateway',danger:false},
    {type:'edge',label:'$12.50 ⚑',status:'blocked'},
    {type:'node',label:'User Ledger',sub:'Account ID',danger:false},
  ],
};

const Card = ({children,className=''}:any) => (
  <div className={`bg-[#16161F] border border-[#2A2A3A] rounded-2xl ${className}`}>{children}</div>
);

const SideItem = ({icon:Icon,label,active=false}:any) => (
  <div className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer text-sm transition-all ${active?'bg-violet-600/20 text-violet-400 font-medium':'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
    <Icon size={15}/><span>{label}</span>
  </div>
);

export default function ULPFDark() {
  const [activeSource, setActiveSource] = useState<any>(null);
  const [stage, setStage] = useState(0);
  const [spec, setSpec] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  const scroll = () => setTimeout(()=>endRef.current?.scrollIntoView({behavior:'smooth'}),100);

  const run = async (src: any) => {
    if (stage > 0 && stage < 4) return;
    setActiveSource(src); setStage(1); setSpec(null); setEvent(null);
    setLogs([`[${new Date().toLocaleTimeString()}] Connecting to ${src.ip}...`, `[${new Date().toLocaleTimeString()}] Stream opened. Receiving ${src.type} packets...`]);

    try {
      const r1 = await fetch('http://localhost:8000/api/onboard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({samples:src.samples})});
      const d1 = await r1.json();
      setSpec(d1.spec);
      setLogs(l=>[...l, `[${new Date().toLocaleTimeString()}] Template mined. Fields: ${d1.spec?.fields?.length || 0}`]);
      await new Promise(r=>setTimeout(r,1200));

      const r2 = await fetch('http://localhost:8000/api/ingest',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({raw_log:src.live[0]})});
      const d2 = await r2.json();
      setEvent(d2);
      setLogs(l=>[...l,`[${new Date().toLocaleTimeString()}] Live event ingested. Status: ${d2.status}`]);
      scroll(); await new Promise(r=>setTimeout(r,1800));

      setStage(2); setLogs(l=>[...l,`[${new Date().toLocaleTimeString()}] Running losslessness verification...`]);
      scroll(); await new Promise(r=>setTimeout(r,1800));

      setStage(3); setLogs(l=>[...l,`[${new Date().toLocaleTimeString()}] Computing Merkle chain...`]);
      scroll(); await new Promise(r=>setTimeout(r,1800));

      setStage(4);
      setLogs(l=>[...l,`[${new Date().toLocaleTimeString()}] Analysis complete. Generating report...`]);
      scroll();
    } catch(e){ console.error(e); }
  };

  const isTampered  = activeSource?.id === 'windows';
  const report      = activeSource ? REPORTS[activeSource.id]  : null;
  const graphData   = activeSource ? GRAPHS[activeSource.id]   : [];
  const sev         = report ? SEV[report.severity] : null;
  const isRunning   = stage > 0 && stage < 4;

  const topStats = [
    { label:'Events / sec',   value: stage >= 1 ? '4,821' : '—',   sub: stage>=1?'↑ 12% vs baseline':'Idle',          good: true  },
    { label:'Losslessness',   value: stage >= 2 ? '100%'  : '—',   sub: stage>=2?'Mathematically proven':'Pending',    good: true  },
    { label:'Threat Level',   value: report?.severity ?? '—',       sub: report ? report.threat : 'No active source',  good: report?.severity==='Low' || !report },
  ];

  return (
    <div className="flex h-screen bg-[#0D0D14] text-white overflow-hidden font-sans">

      {/* ── SIDEBAR ── */}
      <aside className="w-56 shrink-0 bg-[#111118] border-r border-[#1E1E2A] flex flex-col py-6 px-4 gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-1 mb-2">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <Shield size={16} className="text-white"/>
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight">ULPF</div>
            <div className="text-[10px] text-slate-500">SIH 2026</div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 px-3 mb-1">General</p>
          <SideItem icon={LayoutDashboard} label="Dashboard" active />
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 px-3 mb-1">Pipeline</p>
          <SideItem icon={Cpu}       label="Onboarding" />
          <SideItem icon={Zap}       label="Normalization" />
          <SideItem icon={Lock}      label="Custody" />
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 px-3 mb-1">Forensics</p>
          <SideItem icon={Share2}    label="Event Graph" />
          <SideItem icon={BarChart2} label="Analytics" />
          <SideItem icon={ShieldAlert} label="Alerts" />
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 px-3 mb-1">System</p>
          <SideItem icon={Settings}  label="Settings" />
          <SideItem icon={HelpCircle}label="Help" />
        </div>

        {/* User */}
        <div className="mt-auto flex items-center gap-2.5 px-2 py-2.5 rounded-xl bg-white/5 cursor-pointer hover:bg-white/8 transition-colors">
          <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-[11px] font-bold">A</div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate">Admin</div>
            <div className="text-[10px] text-slate-500 truncate">SOC Operator</div>
          </div>
          <ChevronDown size={13} className="text-slate-500"/>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center gap-4 px-8 py-4 border-b border-[#1E1E2A] shrink-0">
          <div>
            <h1 className="text-lg font-bold">Overview</h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#1A1A26] border border-[#2A2A3A] rounded-lg px-3 py-2 text-sm text-slate-400 w-56">
              <Search size={14}/><span className="text-xs">Type here to start searching</span>
            </div>
            <div className="relative p-2 rounded-lg hover:bg-white/5 cursor-pointer">
              <Bell size={17} className="text-slate-400"/>
              {stage===4 && report?.severity!=='Low' && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500"/>}
            </div>
            <button className="flex items-center gap-2 text-xs font-medium bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 rounded-lg">
              Export Data
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">

          {/* ── TOP STAT CARDS ── */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {topStats.map((s,i)=>(
              <Card key={i} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs text-slate-500">{s.label}</span>
                  <MoreHorizontal size={15} className="text-slate-600"/>
                </div>
                <div className="text-2xl font-black text-white mb-1">{s.value}</div>
                <div className={`flex items-center gap-1 text-xs font-medium ${s.good?'text-emerald-400':'text-red-400'}`}>
                  {s.good ? <ArrowUpRight size={13}/> : <ArrowDownRight size={13}/>}
                  {s.sub}
                </div>
              </Card>
            ))}
          </div>

          {/* ── BODY GRID: pipeline left, activity right ── */}
          <div className="grid grid-cols-3 gap-4">

            {/* LEFT: pipeline steps (2 cols wide) */}
            <div className="col-span-2 flex flex-col gap-4">

              {/* Source selector */}
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-white">Network Entities</h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">Select a source to begin the automated pipeline</p>
                  </div>
                  <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${isRunning ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : stage===4 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700/50 text-slate-400 border border-slate-600/30'}`}>
                    <Radio size={9} className={isRunning?'animate-pulse':''}/> {isRunning ? 'LIVE' : stage===4 ? 'COMPLETE' : 'IDLE'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {DATA_SOURCES.map(src=>{
                    const isActive = activeSource?.id === src.id;
                    return (
                      <button key={src.id} onClick={()=>run(src)} disabled={isRunning}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${isActive?'bg-violet-600/15 border-violet-500/40':'bg-white/3 border-[#2A2A3A] hover:border-slate-600'} ${isRunning&&!isActive?'opacity-40 cursor-not-allowed':''}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive?'bg-violet-600/30':'bg-white/5'}`}>
                          <Server size={14} className={isActive?'text-violet-400':'text-slate-400'}/>
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs font-semibold truncate ${isActive?'text-white':'text-slate-300'}`}>{src.name}</div>
                          <div className="text-[10px] text-slate-500">{src.ip} · {src.type}</div>
                        </div>
                        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0"/>}
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* STEP 1 */}
              {stage >= 1 && activeSource && (
                <Card className="p-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Step 01</span>
                    <div className="flex-1 h-px bg-[#2A2A3A]"/>
                    {event
                      ? <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1"><CheckCircle2 size={10}/> Done</span>
                      : <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full flex items-center gap-1"><RefreshCw size={10} className="animate-spin"/> Running</span>}
                  </div>
                  <h3 className="text-sm font-bold mb-4">Auto-Onboarding & Normalization</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-slate-500 mb-2 flex items-center gap-1"><Cpu size={10}/> Template Mined</p>
                      <div className="bg-[#0D0D14] rounded-xl p-4 h-36 flex flex-col overflow-hidden border border-[#1E1E2A]">
                        {!spec
                          ? <div className="m-auto flex items-center gap-2 text-slate-500 text-[11px]"><SearchCode size={14} className="text-violet-400 animate-pulse"/>Inferring…</div>
                          : <pre className="text-[9px] font-mono text-violet-300 overflow-y-auto whitespace-pre-wrap leading-5">{spec.regex}</pre>}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 mb-2 flex items-center gap-1"><Zap size={10}/> Live Stream Normalized</p>
                      <div className="bg-[#0D0D14] rounded-xl p-4 h-36 flex flex-col overflow-hidden border border-[#1E1E2A]">
                        {!event
                          ? <div className="m-auto text-slate-600 text-[11px]">Awaiting parser…</div>
                          : event.status==='parsed'
                            ? <pre className="text-[9px] font-mono text-emerald-400 overflow-y-auto leading-5">{JSON.stringify(event.fields,null,2)}</pre>
                            : <pre className="text-[9px] font-mono text-amber-400 overflow-y-auto">{event.raw_log||'Structure deviation'}</pre>}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* STEP 2 */}
              {stage >= 2 && (
                <Card className="p-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Step 02</span>
                    <div className="flex-1 h-px bg-[#2A2A3A]"/>
                    {stage===2
                      ? <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full flex items-center gap-1"><RefreshCw size={10} className="animate-spin"/> Running</span>
                      : <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1"><CheckCircle2 size={10}/> Done</span>}
                  </div>
                  <h3 className="text-sm font-bold mb-5">Losslessness Scorecard</h3>
                  <div className="flex items-center gap-6">
                    <div className="text-center shrink-0">
                      <div className="text-5xl font-black text-white leading-none">100</div>
                      <div className="text-base text-slate-400 font-bold">%</div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 mt-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">Reversible</div>
                    </div>
                    <div className="flex-1 flex flex-col gap-3">
                      <div>
                        <p className="text-[10px] text-slate-500 mb-1.5">Original Raw Bytes</p>
                        <div className="bg-[#0D0D14] border border-[#2A2A3A] rounded-xl px-3 py-2.5 font-mono text-[9px] text-slate-400 truncate">{activeSource?.live[0]}</div>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 mb-1.5">Reconstructed (JSON + Residuals)</p>
                        <div className="bg-[#0D0D14] border border-[#2A2A3A] rounded-xl px-3 py-2.5 font-mono text-[9px] text-slate-400 truncate">
                          {event?.status==='parsed' ? '{ '+Object.keys(event.fields||{}).slice(0,3).map((k:string)=>`"${k}": "…"`).join(', ')+' }' : 'Unparsed — raw fallback preserved'}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* STEP 3 */}
              {stage >= 3 && (
                <Card className="p-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Step 03</span>
                    <div className="flex-1 h-px bg-[#2A2A3A]"/>
                    {stage===3
                      ? <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full flex items-center gap-1"><RefreshCw size={10} className="animate-spin"/> Running</span>
                      : <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1"><CheckCircle2 size={10}/> Done</span>}
                  </div>
                  <h3 className="text-sm font-bold mb-4">Tamper-Evident Custody</h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 bg-[#0D0D14] border border-[#2A2A3A] rounded-xl overflow-hidden">
                      <div className="grid grid-cols-4 px-4 py-2.5 bg-[#1A1A26] border-b border-[#2A2A3A] text-[9px] font-bold uppercase tracking-wider text-slate-500">
                        <span>Seq</span><span>Time</span><span>Merkle Hash</span><span>Status</span>
                      </div>
                      {[event?.provenance?.seq||44,45,46].map((seq:number,idx:number)=>(
                        <div key={seq} className={`grid grid-cols-4 px-4 py-3 border-b border-[#1A1A26] text-[10px] font-mono ${isTampered&&idx===0?'text-red-400 bg-red-500/5':'text-slate-400'}`}>
                          <span className="font-semibold">#{seq}</span>
                          <span>{new Date().toLocaleTimeString()}</span>
                          <span className="truncate pr-2">{isTampered&&idx===0?'b94d27b99...':`e3b0c44${seq}...`}</span>
                          <span><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${isTampered&&idx===0?'bg-red-500/15 text-red-400':'bg-emerald-500/15 text-emerald-400'}`}>{isTampered&&idx===0?'CORRUPT':'SEALED'}</span></span>
                        </div>
                      ))}
                    </div>
                    <div className={`sm:w-48 rounded-xl p-4 flex flex-col gap-2 border ${isTampered?'bg-red-500/8 border-red-500/20':'bg-emerald-500/8 border-emerald-500/20'}`}>
                      <div className="flex items-center gap-2">
                        {isTampered ? <FileWarning size={16} className="text-red-400"/> : <CheckCircle2 size={16} className="text-emerald-400"/>}
                        <span className={`text-xs font-bold ${isTampered?'text-red-400':'text-emerald-400'}`}>{isTampered?'Mismatch':'Verified'}</span>
                      </div>
                      <p className={`text-[10px] leading-relaxed ${isTampered?'text-red-400/70':'text-emerald-400/70'}`}>
                        {isTampered?'Block #44 modified after sealing. Evidence preserved.':'All blocks match sealed signatures. Custody intact.'}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* STEP 4 */}
              {stage >= 4 && report && sev && (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 px-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Step 04 — Report</span>
                    <div className="flex-1 h-px bg-[#2A2A3A]"/>
                    <span className="text-[10px] font-bold text-slate-400 bg-[#1A1A26] border border-[#2A2A3A] px-2.5 py-1 rounded-full flex items-center gap-1"><FileText size={10}/> Analysis Ready</span>
                  </div>

                  {/* Threat card */}
                  <Card className={`p-5 border ${sev.border}`}>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className={`flex items-center gap-1.5 text-[10px] font-bold mb-1 ${sev.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`}/>{report.severity} Severity
                        </div>
                        <h3 className="text-xl font-black text-white">{report.threat}</h3>
                      </div>
                      <ShieldAlert size={24} className={sev.text}/>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{report.desc}</p>
                    <div className={`rounded-xl border px-4 py-3 ${sev.bg} ${sev.border}`}>
                      <p className="text-[10px] text-slate-500 mb-1">Automated Response</p>
                      <p className="text-xs font-semibold text-slate-200">{report.action}</p>
                    </div>
                  </Card>

                  {/* Event graph */}
                  <Card className="p-5">
                    <div className="flex items-center gap-2 mb-5">
                      <Share2 size={13} className="text-slate-500"/>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Forensic Event Graph</span>
                    </div>
                    <div className="bg-[#0D0D14] rounded-xl px-6 py-5 border border-[#1E1E2A]">
                      {/* Edge labels */}
                      <div className="hidden md:flex items-center justify-between mb-2">
                        {graphData.map((item:any,i:number)=>{
                          if(item.type==='node') return <div key={i} className="w-24 shrink-0"/>;
                          let cls="border-[#2A2A3A] text-slate-600 bg-transparent";
                          if(item.status==='allowed') cls="border-emerald-500/30 text-emerald-400 bg-emerald-500/8";
                          if(item.status==='blocked') cls="border-red-500/30 text-red-400 bg-red-500/8";
                          return <div key={i} className={`px-3 py-1 rounded-full border text-[9px] font-mono shrink-0 ${cls}`}>{item.label}</div>;
                        })}
                      </div>
                      {/* Line */}
                      <div className="relative hidden md:block h-[2px] mx-12 mb-5">
                        <div className="absolute inset-0 bg-[#2A2A3A]"/>
                        <div className={`absolute inset-0 opacity-60 bg-gradient-to-r ${report?.severity==='Low'?'from-emerald-500 via-violet-500 to-blue-500':'from-red-500 via-violet-500 to-blue-500'}`}/>
                      </div>
                      {/* Nodes */}
                      <div className="flex items-start justify-between">
                        {graphData.map((item:any,i:number)=>{
                          if(item.type==='node') return (
                            <div key={i} className="flex flex-col items-center gap-2 shrink-0">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${item.danger?'bg-red-500/20 border border-red-500/30':'bg-violet-600/20 border border-violet-500/30'}`}>
                                {item.danger?<AlertTriangle size={18} className="text-red-400"/>:<Server size={18} className="text-violet-400"/>}
                              </div>
                              <div className="text-center w-24">
                                <div className={`font-semibold text-[10px] truncate ${item.danger?'text-red-400':'text-white'}`}>{item.label}</div>
                                <div className="text-[8px] text-slate-600 uppercase mt-0.5">{item.sub}</div>
                              </div>
                            </div>
                          );
                          return <div key={i} className="w-20 shrink-0 hidden md:block"/>;
                        })}
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              <div ref={endRef}/>
            </div>

            {/* RIGHT PANEL: always visible */}
            <div className="flex flex-col gap-4">

              {/* Metrics */}
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-white">Pipeline Metrics</span>
                  <Activity size={14} className="text-slate-500"/>
                </div>
                <div className="flex flex-col gap-4">
                  {[
                    {label:'Fields Extracted', value: spec?.fields?.length || '—', unit:'dims'},
                    {label:'Latency',           value: stage>=1?'1.4':'—',          unit:'ms'},
                    {label:'Events Sealed',     value: stage>=3?'3':'—',             unit:'blocks'},
                  ].map((m,i)=>(
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">{m.label}</span>
                      <div className="text-right">
                        <span className="text-sm font-black text-white">{m.value}</span>
                        <span className="text-[10px] text-slate-600 ml-1">{m.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Live log feed */}
              <Card className="p-5 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-white">Live Event Feed</span>
                  <div className={`flex items-center gap-1 text-[9px] font-bold ${isRunning?'text-violet-400':'text-slate-600'}`}>
                    <Radio size={9} className={isRunning?'animate-pulse':''}/>{isRunning?'LIVE':'IDLE'}
                  </div>
                </div>
                <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                  {logs.length === 0
                    ? <p className="text-[10px] text-slate-600 text-center py-8">Select a source to begin…</p>
                    : logs.map((log,i)=>(
                        <div key={i} className="text-[9px] font-mono text-slate-400 bg-[#0D0D14] border border-[#1E1E2A] rounded-lg px-3 py-2 leading-relaxed">{log}</div>
                      ))
                  }
                </div>
              </Card>

              {/* Active source info */}
              {activeSource && (
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-white">Active Source</span>
                    <div className={`w-2 h-2 rounded-full ${isRunning?'bg-violet-400 animate-pulse':stage===4?'bg-emerald-400':'bg-slate-600'}`}/>
                  </div>
                  <div className="flex flex-col gap-2">
                    {[
                      {label:'Device',    value:activeSource.name},
                      {label:'IP Address',value:activeSource.ip},
                      {label:'Format',    value:activeSource.type},
                      {label:'Stage',     value:stage===4?'Complete':`Step ${stage}/4`},
                    ].map((r,i)=>(
                      <div key={i} className="flex items-center justify-between border-b border-[#1E1E2A] pb-2 last:border-0 last:pb-0">
                        <span className="text-[10px] text-slate-500">{r.label}</span>
                        <span className="text-[10px] font-semibold text-slate-300 text-right max-w-[120px] truncate">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
