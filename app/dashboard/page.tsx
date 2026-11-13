 "use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowDownRight, ArrowUpRight, Bot, Boxes, Braces, Check, ChevronDown, CircleHelp, Clock3, Database, Gauge, LayoutDashboard, Menu, MoreHorizontal, Network, Search, Settings2, ShieldCheck, Sparkles, Terminal, Zap } from "lucide-react";
import Scene from "../scene";
import { Migration, Schema, ago, api } from "../lib/api";
import { ComingSoon, Migrations, PENDING, SchemaExplorer } from "./views";

const navItems = [
  {label:"Overview",icon:LayoutDashboard},
  {label:"Schema explorer",icon:Network},
  {label:"Migrations",icon:Boxes},
  {label:"Query optimizer",icon:Gauge},
  {label:"Security auditor",icon:ShieldCheck}
];
export default function Dashboard() {
  const [active,setActive]=useState("Overview");
  const [prompt,setPrompt]=useState("");
  const [space,setSpace]=useState(true);
  const [mobileNav,setMobileNav]=useState(false);
  const [online,setOnline]=useState<boolean|null>(null);
  const [migs,setMigs]=useState<Migration[]>([]);
  const [schema,setSchema]=useState<Schema|null>(null);
  const [thinking,setThinking]=useState(false);
  const [askError,setAskError]=useState("");
  const [proposal,setProposal]=useState<Migration|null>(null);
  const reload=useCallback(async()=>{
    try{ await api.health(); setOnline(true); setMigs(await api.migrations()); setSchema(await api.schema()); }
    catch{ setOnline(false); }
  },[]);
  useEffect(()=>{ reload(); const t=setInterval(reload,5000); return ()=>clearInterval(t); },[reload]);
  const pending=migs.filter(m=>PENDING.includes(m.status)).length;
  async function ask(q=prompt){
    if(q.trim().length<3||thinking) return;
    setPrompt(q); setThinking(true); setAskError(""); setProposal(null);
    try{ setProposal(await api.propose(q.trim())); await reload(); }
    catch(e:any){ setAskError(e.message); }
    finally{ setThinking(false); }
  }
  return <main className="dashboard-shell">
    <aside className={`sidebar ${mobileNav?"open":""}`}>
      <Link href="/" className="brand"><span className="brand-mark"><Database size={17}/></span><span>QueryX <b>AI</b></span></Link>
      <div className="workspace"><div className="workspace-icon">QX</div><div><b>Core workspace</b><small>Personal environment</small></div><ChevronDown size={14}/></div>
      <div className="side-label">WORKSPACE</div>
      <nav className="side-nav">{navItems.map(({label,icon:Icon})=><button key={label} onClick={()=>setActive(label)} className={active===label?"active":""}><Icon size={17}/><span>{label}</span>{label==="Migrations"&&pending>0&&<small>{pending}</small>}</button>)}</nav>
      <div className="side-label">SYSTEM</div>
      <nav className="side-nav"><button onClick={()=>setActive("Activity logs")} className={active==="Activity logs"?"active":""}><Activity size={17}/><span>Activity logs</span></button><button onClick={()=>setActive("Settings")} className={active==="Settings"?"active":""}><Settings2 size={17}/><span>Settings</span></button></nav>
      <div className="sidebar-bottom"><div className="help-row"><CircleHelp size={16}/> Documentation <ArrowUpRight size={13}/></div><div className="user-row"><div className="avatar">Q</div><div><b>QueryX Operator</b><small>Workspace admin</small></div><MoreHorizontal size={17}/></div></div>
    </aside>
    <section className="dashboard-main">
      <header className="dash-topbar"><button className="mobile-menu" onClick={()=>setMobileNav(!mobileNav)}><Menu/></button><div className="breadcrumbs">Workspace <span>/</span> <b>{active}</b></div><div className="topbar-right"><div className="connection"><i style={online===false?{background:"#ff6b6b",boxShadow:"0 0 9px #ff6b6b88"}:undefined}/> {online===null?"Connecting...":online?"API connected":"API offline"}</div><button className="icon-button"><Search size={17}/></button><button className="icon-button"><CircleHelp size={17}/></button><div className="avatar">Q</div></div></header>
      <div className="dash-content">
        <div className="dash-heading"><div><div className="eyebrow">MISSION CONTROL / QX-001</div><h1>{active}</h1><p>{active==="Overview"?"Plain English in. Safe, tested database changes out.":active==="Migrations"?"Propose, test, approve and apply database changes.":active==="Schema explorer"?"Tables, columns and keys, read live from your database.":"Coming soon."}</p></div><button className="outline-btn" onClick={()=>setSpace(!space)}><span className="tiny-orb"/> {space?"Orbit environment":"Studio environment"} <ChevronDown size={14}/></button></div>
        {active==="Overview"&&<div className="metrics-grid">
          <Metric title="TABLES" value={schema?String(schema.tables.length):"-"} unit="" delta={schema?`PostgreSQL ${schema.server_version.split(" ")[0]}`:"no data"} icon={Network}/>
          <Metric title="MIGRATIONS" value={String(migs.length)} unit="" delta="all time" icon={Boxes}/>
          <Metric title="NEED ACTION" value={String(pending)} unit="" delta="test, approve or apply" icon={Clock3}/>
          <Metric title="APPLIED" value={String(migs.filter(m=>m.status==="APPLIED").length)} unit="" delta="on the real database" icon={Check}/>
        </div>}
        {active==="Overview"&&<><div className="dashboard-panels">
          <section className="panel core-panel"><div className="panel-header"><div><span className="panel-kicker">LIVE SYSTEM MODEL</span><h2>Database topology</h2></div><button className="icon-button"><MoreHorizontal size={18}/></button></div><div className="core-scene"><Scene mode={space?"space":"studio"}/><div className="scene-tag"><span/> DATABASE <b>{schema?"CONNECTED":"OFFLINE"}</b></div><div className="scene-caption"><span>QX / CORE VISUALIZATION</span><span>DRAG TO ORBIT</span></div></div><div className="topology-legend"><span><i className="legend-blue"/> PostgreSQL primary</span><span><i className="legend-white"/> Read replicas</span><span><i className="legend-cyan"/> AI observer</span></div></section>
          <section className="panel copilot-panel"><div className="panel-header"><div><span className="panel-kicker">INTELLIGENCE LAYER</span><h2><Sparkles size={17}/> AI Copilot</h2></div><span className="demo-pill">{online?"LIVE":"OFFLINE"}</span></div><div className="copilot-intro"><div className="bot-orb"><Bot size={22}/></div><div><b>Ready to write a migration.</b><p>Describe a database change in plain English.</p></div></div>{thinking&&<div className="copilot-answer"><b>QueryX</b><p>Writing the migration. This can take up to 30 seconds...</p></div>}
{askError&&<div className="copilot-answer bad"><b>Problem</b><p>{askError}</p></div>}
{proposal&&<div className="copilot-answer"><b>{proposal.status==="CHECKED"?`Migration #${proposal.id} is ready`:`Request #${proposal.id} was stopped`}</b><p>{proposal.status==="CHECKED"?proposal.summary:proposal.error}</p>{proposal.up_sql&&<pre className="mini-sql">{proposal.up_sql}</pre>}<button className="text-link" onClick={()=>setActive("Migrations")}>Review and approve <ArrowUpRight size={13}/></button></div>}<div className="prompt-suggestions"><button onClick={()=>ask("Add a nickname column to users")}>Add a nickname column to users <ArrowUpRight size={13}/></button><button onClick={()=>ask("Add an index on orders user_id")}>Add an index on orders user_id <ArrowUpRight size={13}/></button><button onClick={()=>setActive("Migrations")}>Review pending migrations <ArrowUpRight size={13}/></button></div><form className="prompt-form" onSubmit={e=>{e.preventDefault();ask();}}><input value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Describe a change, e.g. Add a nickname column to users"/><button aria-label="Send prompt"><ArrowDownRight size={17}/></button></form><div className="copilot-foot"><span><i/> {online?"AI engine ready":"API offline"}</span><span><ShieldCheck size={12}/> Nothing runs without approval</span></div></section>
        </div>
        <div className="lower-grid"><section className="panel"><div className="panel-header"><div><span className="panel-kicker">PERFORMANCE</span><h2>Query latency</h2></div><span className="demo-pill">SAMPLE DATA</span></div><div className="latency-summary"><strong>24.8 <small>ms</small></strong><span className="positive"><ArrowDownRight size={14}/> 12.8% vs previous period</span></div><div className="chart-wrap"><LatencyChart/></div><div className="chart-axis"><span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>24:00</span></div></section><section className="panel activity-panel"><div className="panel-header"><div><span className="panel-kicker">AUDIT TRAIL</span><h2>Recent activity</h2></div><button className="text-link" onClick={()=>setActive("Migrations")}>View all <ArrowUpRight size={13}/></button></div>{migs.length===0&&<p className="empty left">No activity yet.</p>}{migs.slice(0,4).map(m=>{const bad=["REJECTED","FAILED","ROLLBACK_FAILED"].includes(m.status);return <ActivityRow key={m.id} icon={m.status==="APPLIED"?Check:bad?Clock3:Braces} color={m.status==="APPLIED"?"green":m.status==="ROLLED_BACK"?"purple":bad?"amber":"blue"} title={m.request} meta={`#${m.id} · ${ago(m.created_at)}`} status={m.status.replace("_"," ")}/>})}</section></div>
        </>}
        {active==="Migrations"&&<Migrations migs={migs} reload={reload}/>}
        {active==="Schema explorer"&&<SchemaExplorer/>}
        {!["Overview","Migrations","Schema explorer"].includes(active)&&<ComingSoon name={active}/>}
        <footer className="dash-footer"><span>QUERYX AI <b>·</b> AUTONOMOUS DATABASE INTELLIGENCE</span><span><i/> LIVE MIGRATIONS · SAMPLE LATENCY</span></footer>
      </div>
    </section>
  </main>;
}
function Metric({title,value,unit,delta,icon:Icon,good=false}:any){return <article className="metric-card"><div className="metric-top"><span>{title}</span><Icon size={16}/></div><div className="metric-value">{value}<small>{unit}</small></div><div className={`metric-delta ${good?"good":""}`}>{good&&<ArrowDownRight size={13}/>} {delta}</div></article>}
function ActivityRow({icon:Icon,color,title,meta,status}:any){return <div className="activity-row"><div className={`activity-icon ${color}`}><Icon size={15}/></div><div className="activity-copy"><b>{title}</b><span>{meta}</span></div><span className={`activity-status ${color}`}>{status}</span></div>}
function LatencyChart(){return <svg viewBox="0 0 600 130" preserveAspectRatio="none" className="latency-chart"><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#38bdf8" stopOpacity=".24"/><stop offset="100%" stopColor="#38bdf8" stopOpacity="0"/></linearGradient></defs>{[25,55,85,115].map(y=><line key={y} x1="0" y1={y} x2="600" y2={y} stroke="currentColor" opacity=".1" strokeDasharray="3 5"/>)}<path d="M0 83 C20 77 26 89 45 72 S72 88 92 66 S118 73 137 60 S160 83 181 64 S206 55 225 69 S247 40 270 52 S297 64 315 44 S342 53 360 36 S387 55 406 46 S433 63 451 39 S477 47 496 31 S523 49 542 28 S574 42 600 20 L600 130 L0 130 Z" fill="url(#area)"/><path d="M0 83 C20 77 26 89 45 72 S72 88 92 66 S118 73 137 60 S160 83 181 64 S206 55 225 69 S247 40 270 52 S297 64 315 44 S342 53 360 36 S387 55 406 46 S433 63 451 39 S477 47 496 31 S523 49 542 28 S574 42 600 20" fill="none" stroke="#38bdf8" strokeWidth="2.2" vectorEffect="non-scaling-stroke"/></svg>}
