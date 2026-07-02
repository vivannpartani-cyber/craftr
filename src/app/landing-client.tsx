"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { BrainCircuit, ArrowRight, Zap, Globe, Cpu, Brain, BarChart2, Map, Palette, PieChart, Rocket, Search, Target, Presentation, Mail } from "lucide-react";
import { useRef } from "react";
import Link from "next/link";

const AGENTS = [
  { title: "Chief of Staff", icon: Brain, desc: "Orchestrates the founding team and creates the master work plan.", phase: "Orchestration" },
  { title: "Market Analyst", icon: BarChart2, desc: "Researches market size, competition, and identifies the gap your startup fills.", phase: "Strategy" },
  { title: "Product Strategist", icon: Map, desc: "Defines the MVP, feature roadmap, and user journey.", phase: "Strategy" },
  { title: "Tech Architect", icon: Cpu, desc: "Designs the technical stack, infrastructure, and system architecture.", phase: "Strategy" },
  { title: "Brand Designer", icon: Palette, desc: "Creates the brand identity, name, tagline, and visual language.", phase: "Strategy" },
  { title: "Financial Analyst", icon: PieChart, desc: "Models MRR, burn rate, and financial runway with real math.", phase: "Strategy" },
  { title: "Launch Strategist", icon: Rocket, desc: "Plans the go-to-market strategy, launch checklist, and growth loops.", phase: "Execution" },
  { title: "Customer Discovery", icon: Search, desc: "Finds your ICP on social platforms and writes personalized outreach.", phase: "Execution" },
  { title: "Investor Radar", icon: Target, desc: "Identifies the best VCs for your idea and drafts cold emails.", phase: "Execution" },
  { title: "Website Builder", icon: Globe, desc: "Generates a fully coded, production-ready landing page for your startup.", phase: "Execution" },
];

function TextReveal({ text }: { text: string }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.4"]
  });
  
  const words = text.split(" ");
  return (
    <div ref={containerRef} className="max-w-4xl mx-auto py-32 px-6">
      <p className="text-3xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground/10 leading-[1.2] flex flex-wrap gap-x-3 gap-y-2 justify-center text-center">
        {words.map((word, i) => {
          const start = i / words.length;
          const end = start + (1 / words.length);
          const opacity = useTransform(scrollYProgress, [start, end], [0.1, 1]);
          return (
            <motion.span key={i} style={{ opacity }} className="text-foreground">
              {word}
            </motion.span>
          );
        })}
      </p>
    </div>
  );
}

function StickyAgentSequence() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <div ref={containerRef} className="h-[1000vh] relative w-full mt-40">
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        <div className="text-center absolute top-24 md:top-32 left-0 right-0 px-6 z-10">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-4">Meet your founding team.</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">10 specialized autonomous agents working in sequence to bring your idea to life.</p>
        </div>
        
        {AGENTS.map((agent, i) => {
          const n = AGENTS.length;
          const start  = i / n;
          const peak   = (i + 0.5) / n;
          const end    = (i + 1) / n;

          const x       = useTransform(scrollYProgress, [start, peak, end], ["-120%", "0%", "120%"]);
          const scale   = useTransform(scrollYProgress, [start, peak, end], [0.6, 1.0, 0.6]);
          const opacity = useTransform(scrollYProgress, [start, start + 0.04, peak, end - 0.04, end], [0, 1, 1, 1, 0]);

          return (
            <motion.div
              key={i}
              style={{ x, scale, opacity }}
              className="absolute flex flex-col items-center justify-center w-[90%] max-w-md p-10 bg-white/70 backdrop-blur-2xl rounded-[2rem] border border-black/5 shadow-[0_30px_80px_rgba(0,0,0,0.08)]"
            >
              <div className="absolute top-4 right-4 text-[10px] uppercase font-mono tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full">
                {agent.phase}
              </div>
              <div className="p-5 bg-primary/10 rounded-2xl text-primary mb-6 mt-4">
                <agent.icon className="w-12 h-12" />
              </div>
              <h3 className="font-bold text-3xl tracking-tight text-foreground mb-4 text-center">{agent.title}</h3>
              <p className="text-lg text-muted-foreground text-center leading-relaxed">
                {agent.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function LandingPageClient() {
  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      {/* Header */}
      <header className="df-header-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-primary" />
            <span className="font-semibold tracking-tight text-foreground">craftr <span className="text-muted-foreground font-normal text-xs">by Forge</span></span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Log in
            </a>
            <a href="/login" className="btn-brand text-sm px-4 py-1.5 rounded-full shadow-sm">
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-32">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div variants={item} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono uppercase tracking-widest mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Craftr is now live
          </motion.div>

          <motion.h1 variants={item} className="text-5xl md:text-7xl font-semibold tracking-tight text-foreground mb-6">
            Launch your startup in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">3 minutes.</span>
          </motion.h1>

          <motion.p variants={item} className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            One sentence. Ten AI agents. Your complete startup foundation — market analysis, brand, financials, investor deck, customer discovery, and a live website.
          </motion.p>

          <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/login" className="btn-brand px-8 py-3 rounded-full text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all w-full sm:w-auto flex items-center justify-center gap-2">
              Start building for free <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#how-it-works" className="btn-link-muted border border-black/10 bg-white shadow-sm px-8 py-3 rounded-full text-base transition-all w-full sm:w-auto flex items-center justify-center">
              See how it works
            </a>
          </motion.div>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          className="mt-24 df-card overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-2xl border-black/5 bg-background"
        >
          <div className="bg-white border-b border-black/5 p-4 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="mx-auto text-xs font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <BrainCircuit className="w-3 h-3" /> Command Center
            </div>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Live Metrics */}
            <div className="col-span-1 md:col-span-3 df-card p-6 bg-gradient-to-br from-gray-900 to-black text-white rounded-xl relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <div>
                  <div className="text-3xl font-semibold mb-1">$4,600</div>
                  <div className="text-xs text-white/50 uppercase tracking-widest">Projected MRR (M6)</div>
                </div>
                <div>
                  <div className="text-3xl font-semibold mb-1">85/100</div>
                  <div className="text-xs text-white/50 uppercase tracking-widest">Startup Health Score</div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1 leading-relaxed">The total addressable market for student organization tools is approximately $1.5 billion in the US alone, with a global market potential of $5 billion.</div>
                  <div className="text-xs text-white/50 uppercase tracking-widest">Total Market (TAM)</div>
                </div>
              </div>
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
            </div>

            {/* Knowledge Graph Mock */}
            <div className="col-span-1 df-card p-5 bg-white border border-black/5 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Agent Active</span>
              </div>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 mt-1.5 rounded-full shrink-0 bg-blue-500"></div>
                  <div>
                    <p className="text-xs font-medium text-foreground">Market Monitor</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Competitor AcmeCo just launched AI features.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 mt-1.5 rounded-full shrink-0 bg-purple-500"></div>
                  <div>
                    <p className="text-xs font-medium text-foreground">Financial Analyst</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Updated MRR projections based on new market data.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 3 Agents Mocks */}
            <div className="col-span-1 df-card p-5 bg-white border border-black/5 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-medium text-foreground">Customer Discovery</h4>
              </div>
              <p className="text-[10px] text-muted-foreground mb-3">Extracted 3 core pain points and 2 niche subreddits for your ICP.</p>
              <div className="bg-primary/5 text-[10px] font-mono p-2 rounded text-primary">Found: B2B SaaS Founders</div>
            </div>

            <div className="col-span-1 df-card p-5 bg-white border border-black/5 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-medium text-foreground">Investor Radar</h4>
              </div>
              <p className="text-[10px] text-muted-foreground mb-3">Identified 15 seed-stage VCs matching your specific niche.</p>
              <div className="bg-primary/5 text-[10px] font-mono p-2 rounded text-primary">Matched: Sequoia, a16z</div>
            </div>
          </div>
        </motion.div>

        {/* Time Savings Chart */}
        <div className="mt-40 pt-20 border-t border-black/5 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">From idea to launch, faster than ever.</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-16">Stop spending months on market research and pitch decks.</p>

          <div className="max-w-2xl mx-auto flex items-end justify-center gap-12 h-64 mb-12 border-b border-black/10 pb-4 relative">
            {/* Grid lines */}
            <div className="absolute left-0 right-0 bottom-1/4 h-px bg-black/5"></div>
            <div className="absolute left-0 right-0 bottom-2/4 h-px bg-black/5"></div>
            <div className="absolute left-0 right-0 bottom-3/4 h-px bg-black/5"></div>

            <div className="relative flex flex-col items-center justify-end h-full group w-32">
              <div className="w-full bg-gray-200 rounded-t-lg h-[85%] transition-all group-hover:bg-gray-300"></div>
              <div className="absolute -bottom-8 text-sm font-medium text-muted-foreground">Traditional</div>
              <div className="absolute -top-6 text-xs font-bold text-gray-500">~6 Months</div>
            </div>

            <div className="relative flex flex-col items-center justify-end h-full group w-32">
              <div className="w-full bg-primary rounded-t-lg h-[5%] shadow-[0_0_20px_rgba(29,78,216,0.4)]"></div>
              <div className="absolute -bottom-8 text-sm font-bold text-foreground">craftr</div>
              <div className="absolute -top-6 text-xs font-bold text-primary">3 Minutes</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto text-center">
            <div>
              <div className="text-3xl font-bold text-foreground mb-1">10x</div>
              <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Faster execution</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-1">10</div>
              <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">AI agents</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-1">100%</div>
              <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Free to start</div>
            </div>
          </div>
        </div>

        {/* Feature Snippets Section */}
        <div className="mt-40 pt-20 border-t border-black/5">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">Everything you need to launch.</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Not just a landing page. A complete business foundation built by AI.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 1. Command Center */}
            <div className="df-card p-6 bg-white hover:shadow-lg transition-all duration-300 group">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Live Command Center</h3>
              <p className="text-sm text-muted-foreground mb-6 h-10">Real-time MRR, health score, and runway metrics updated by the agent every minute.</p>
              <div className="bg-gray-900 rounded-lg p-3 text-white">
                <div className="flex justify-between items-center text-xs">
                  <span className="opacity-70">Projected MRR</span>
                  <span className="font-bold text-green-400">$12,450</span>
                </div>
              </div>
            </div>

            {/* 2. Knowledge Graph */}
            <div className="df-card p-6 bg-white hover:shadow-lg transition-all duration-300 group">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Memory Graph</h3>
              <p className="text-sm text-muted-foreground mb-6 h-10">The AI accumulates market intelligence and remembers every decision your startup makes.</p>
              <div className="bg-secondary rounded-lg p-3 border border-black/5">
                <div className="text-[10px] text-muted-foreground flex gap-2">
                  <span className="text-primary font-mono">[monitor]</span> Competition intensifying in B2B SaaS...
                </div>
              </div>
            </div>

            {/* 3. Customer Discovery */}
            <div className="df-card p-6 bg-white hover:shadow-lg transition-all duration-300 group">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Customer Discovery</h3>
              <p className="text-sm text-muted-foreground mb-6 h-10">Simulates deep social research to find your ICP, pain points, and outreach messages.</p>
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                <div className="text-xs font-semibold text-primary mb-1">Target ICP</div>
                <div className="text-[10px] text-muted-foreground">Mid-market SaaS founders struggling with churn.</div>
              </div>
            </div>

            {/* 4. Investor Radar */}
            <div className="df-card p-6 bg-white hover:shadow-lg transition-all duration-300 group">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Investor Radar</h3>
              <p className="text-sm text-muted-foreground mb-6 h-10">Identifies the best VCs for your startup and drafts personalized cold emails.</p>
              <div className="bg-white border shadow-sm rounded-lg p-3">
                <div className="text-xs font-bold text-foreground">Sequoia Capital</div>
                <div className="text-[10px] text-muted-foreground">Thesis: early-stage B2B AI</div>
              </div>
            </div>

            {/* 5. Pitch Deck */}
            <div className="df-card p-6 bg-white hover:shadow-lg transition-all duration-300 group">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                <Presentation className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Pitch Deck Generator</h3>
              <p className="text-sm text-muted-foreground mb-6 h-10">11-slide investor deck generated in seconds based on your market analysis.</p>
              <div className="aspect-[16/9] bg-black text-white rounded-lg p-2 flex items-center justify-center">
                <div className="text-xs font-medium">Slide 3: Market Size</div>
              </div>
            </div>

            {/* 6. Daily Briefing */}
            <div className="df-card p-6 bg-white hover:shadow-lg transition-all duration-300 group">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Daily Briefing Email</h3>
              <p className="text-sm text-muted-foreground mb-6 h-10">Your AI co-founder emails you a morning report with insights, KPIs, and updates.</p>
              <div className="bg-white border shadow-sm rounded-lg p-3 border-l-4 border-l-primary">
                <div className="text-xs font-bold">☕ Good morning, founder.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Text Reveal */}
        <TextReveal text="Every day, founders waste months on research, spreadsheets, and pitch decks. craftr does all of it in 3 minutes — so you can focus on what only you can do: building relationships and shipping product." />

        {/* How it Works Flowchart */}
        <div id="how-it-works" className="mt-40 pt-20 border-t border-black/5">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">How it works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">From a single sentence to a complete startup foundation.</p>
          </div>
          
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10 -translate-y-1/2 hidden md:block" />
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
              {/* Step 1 */}
              <div className="df-card bg-white p-5 text-center shadow-sm relative group">
                <div className="w-10 h-10 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-foreground text-sm mb-2">1. The Spark</h3>
                <p className="text-[10px] text-muted-foreground">You provide a one-sentence pitch of your business idea.</p>
              </div>
              
              {/* Step 2 */}
              <div className="df-card bg-white p-5 text-center shadow-sm relative group md:translate-y-4">
                <div className="w-10 h-10 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-foreground text-sm mb-2">2. Orchestration</h3>
                <p className="text-[10px] text-muted-foreground">Chief of Staff plans the workload and assigns tasks.</p>
              </div>

              {/* Step 3 */}
              <div className="df-card bg-white p-5 text-center shadow-sm relative group md:-translate-y-2">
                <div className="w-10 h-10 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Map className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-foreground text-sm mb-2">3. Strategy</h3>
                <p className="text-[10px] text-muted-foreground">Market, Product, and Finance agents build the model.</p>
              </div>

              {/* Step 4 */}
              <div className="df-card bg-white p-5 text-center shadow-sm relative group md:translate-y-4">
                <div className="w-10 h-10 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-foreground text-sm mb-2">4. Execution</h3>
                <p className="text-[10px] text-muted-foreground">Customer, Investor, and Builder agents execute.</p>
              </div>

              {/* Step 5 */}
              <div className="df-card bg-white p-5 text-center shadow-sm relative group md:-translate-y-2">
                <div className="w-10 h-10 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-foreground text-sm mb-2">5. Always On</h3>
                <p className="text-[10px] text-muted-foreground">Background agents continuously research while you sleep.</p>
              </div>
            </div>
          </div>
        </div>

        {/* The AI Founding Team Sticky Sequence */}
        <StickyAgentSequence />
      </main>

      {/* CTA Banner */}
      <section className="bg-gray-900 text-white py-24 px-6 text-center">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Your AI founding team is ready.</h2>
        <p className="text-xl text-gray-400 mb-10">Start for free. No credit card required.</p>
        <a href="/login" className="btn-brand px-10 py-4 rounded-full text-lg shadow-xl hover:-translate-y-1 transition-all inline-flex items-center gap-2">
          Launch your startup in 3 minutes <ArrowRight className="w-5 h-5" />
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-background">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-black/5">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-primary" />
            <span className="font-semibold tracking-tight text-foreground text-lg">craftr <span className="text-muted-foreground font-normal text-sm">by Forge</span></span>
          </div>
          
          <div className="flex gap-8 text-sm font-medium text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">Features</a>
            <a href="/login" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="/login" className="hover:text-foreground transition-colors">Login</a>
          </div>

          <div className="text-right">
            <p className="text-xs text-muted-foreground">© 2026 Project Forge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
