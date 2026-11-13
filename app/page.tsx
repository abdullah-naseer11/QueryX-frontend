 "use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownRight, ArrowRight, Database, Orbit, ShieldCheck, Zap } from "lucide-react";
import Scene from "./scene";

export default function Landing() {
  const router = useRouter();
  const [sceneMode, setSceneMode] = useState<"space" | "studio">("space");
  return <main className="landing">
    <nav className="topnav">
      <a className="brand" href="#"><span className="brand-mark"><Database size={17}/></span><span>QueryX <b>AI</b></span></a>
      <div className="nav-center"><span>DATABASE INTELLIGENCE</span><i/> <span>MISSION CONTROL</span></div>
      <button className="nav-cta" onClick={() => router.push("/dashboard")}>Open dashboard <ArrowRight size={15}/></button>
    </nav>
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><span className="live-dot"/> AUTONOMOUS DATABASE INTELLIGENCE</div>
        <h1>Your data.<br/><em>Beyond limits.</em></h1>
        <p className="hero-desc">Meet a new command layer for your database. Observe, optimize, and evolve your infrastructure with AI precision.</p>
        <div className="hero-actions">
          <button className="primary-btn" onClick={() => router.push("/dashboard")}>Get started <ArrowDownRight size={17}/></button>
          <button className="text-btn" onClick={() => document.getElementById("capabilities")?.scrollIntoView({behavior:"smooth"})}>Explore capabilities <ArrowRight size={15}/></button>
        </div>
        <div className="hero-stats">
          <div><b>01</b><span>OBSERVE</span></div><div><b>02</b><span>OPTIMIZE</span></div><div><b>03</b><span>EVOLVE</span></div>
        </div>
      </div>
      <div className="hero-visual">
        <div className="visual-top"><span>QX / CORE SYSTEM</span><span className="status"><i/> SYSTEM READY</span></div>
        <Scene mode={sceneMode}/>
        <div className="visual-bottom"><span>FIG 01 — INTELLIGENT DATA CORE</span><div className="mode-switch"><button className={sceneMode==="space"?"selected":""} onClick={()=>setSceneMode("space")}>ORBIT</button><button className={sceneMode==="studio"?"selected":""} onClick={()=>setSceneMode("studio")}>STUDIO</button></div></div>
        <div className="visual-index">QX—001</div>
      </div>
      <div className="hero-footnote"><span>ENGINEERED FOR WHAT’S NEXT</span><span>LATENCY IS A DESIGN CHOICE ↗</span></div>
    </section>
    <section id="capabilities" className="capabilities">
      <div className="section-heading"><div><div className="eyebrow">INTELLIGENCE, IN MOTION</div><h2>One system. <em>Full control.</em></h2></div><p>From a single query to an entire data estate, QueryX helps turn complex operations into clear decisions.</p></div>
      <div className="cap-grid">
        <article className="cap-card"><span className="cap-num">01 / OBSERVE</span><div className="cap-icon"><Orbit/></div><h3>See the whole system</h3><p>Map schemas, dependencies, and live signals into one coherent view.</p><span className="card-line"/></article>
        <article className="cap-card"><span className="cap-num">02 / OPTIMIZE</span><div className="cap-icon"><Zap/></div><h3>Move with precision</h3><p>Surface slow queries and get explainable optimization suggestions.</p><span className="card-line"/></article>
        <article className="cap-card"><span className="cap-num">03 / PROTECT</span><div className="cap-icon"><ShieldCheck/></div><h3>Build in confidence</h3><p>Review migrations, inspect risks, and validate changes before execution.</p><span className="card-line"/></article>
      </div>
      <footer className="site-footer"><span>QUERYX AI © 2026</span><span>DATABASE INTELLIGENCE / BUILT FOR CLARITY</span><button onClick={()=>router.push("/dashboard")}>Enter mission control <ArrowRight size={14}/></button></footer>
    </section>
  </main>;
}
