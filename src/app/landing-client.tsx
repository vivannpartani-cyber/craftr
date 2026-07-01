"use client";

import { motion } from "framer-motion";
import { BrainCircuit, ArrowRight, Zap, Globe, Cpu, Brain, BarChart, Map, Palette, PieChart, Rocket } from "lucide-react";

const AGENTS = [
  { title: "Chief of Staff", icon: Brain, desc: "Orchestrates the founding team and synthesizes results." },
  { title: "Market Analyst", icon: BarChart, desc: "Researches the market, competition, and target customers." },
  { title: "Product Strategist", icon: Map, desc: "Defines the MVP, features, and product roadmap." },
  { title: "Tech Architect", icon: Cpu, desc: "Designs the technical stack and system architecture." },
  { title: "Brand Designer", icon: Palette, desc: "Creates the brand identity, name, and messaging." },
  { title: "Financial Analyst", icon: PieChart, desc: "Models revenue, costs, and financial projections." },
  { title: "Launch Strategist", icon: Rocket, desc: "Plans the go-to-market strategy and launch playbook." },
  { title: "Website Builder", icon: Globe, desc: "Generates a complete, deployable landing page." },
];

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
            The AI co-founder <br className="hidden md:block" />for your next startup.
          </motion.h1>

          <motion.p variants={item} className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Describe your idea in one sentence. Our autonomous team of AI agents will analyze the market, design the brand, and build your landing page in minutes.
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

        {/* Vision/Terminal Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          className="mt-24 df-card overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-2xl border-black/5"
        >
          <div className="bg-white/50 backdrop-blur-sm border-b border-black/5 p-4 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="mx-auto text-xs font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <BrainCircuit className="w-3 h-3" /> Craftr AI Orchestrator
            </div>
          </div>
          <div className="p-8 bg-white/30 backdrop-blur-md">
            <div className="font-mono text-sm space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <span className="text-primary font-bold">{'>'}</span> Initialize Project: <span className="text-foreground">"Acme AI"</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span className="text-primary font-bold">{'>'}</span> Spawning Market Analyst... <span className="text-green-600">[OK]</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span className="text-primary font-bold">{'>'}</span> Spawning Tech Architect... <span className="text-green-600">[OK]</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span className="text-primary font-bold">{'>'}</span> Generating Landing Page HTML...
              </div>
              <div className="pl-6 text-xs text-foreground/70 border-l-2 border-primary/20">
                &lt;html&gt;<br />
                &nbsp;&nbsp;&lt;body className="bg-[#FBFBF8]"&gt;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&lt;h1&gt;Acme AI&lt;/h1&gt;<br />
                &nbsp;&nbsp;&lt;/body&gt;<br />
                &lt;/html&gt;
              </div>
              <div className="flex items-center gap-3 text-muted-foreground pt-2">
                <span className="text-primary font-bold">{'>'}</span> Status: <span className="text-primary font-semibold">Ready for deployment</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* How it Works Flowchart */}
        <div id="how-it-works" className="mt-40 pt-20 border-t border-black/5">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">How it works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">From a single sentence to a complete startup foundation.</p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10 -translate-y-1/2 hidden md:block" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              {/* Step 1 */}
              <div className="df-card bg-white p-6 text-center shadow-sm relative group">
                <div className="w-12 h-12 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-foreground mb-2">1. The Spark</h3>
                <p className="text-xs text-muted-foreground">You provide a one-sentence pitch of your business idea.</p>
              </div>
              
              {/* Step 2 */}
              <div className="df-card bg-white p-6 text-center shadow-sm relative group md:translate-y-6">
                <div className="w-12 h-12 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-foreground mb-2">2. Orchestration</h3>
                <p className="text-xs text-muted-foreground">Our Chief of Staff agent plans the workload and assigns tasks.</p>
              </div>

              {/* Step 3 */}
              <div className="df-card bg-white p-6 text-center shadow-sm relative group">
                <div className="w-12 h-12 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Map className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-foreground mb-2">3. Strategy Phase</h3>
                <p className="text-xs text-muted-foreground">Market, Product, and Finance agents build out the business model.</p>
              </div>

              {/* Step 4 */}
              <div className="df-card bg-white p-6 text-center shadow-sm relative group md:translate-y-6">
                <div className="w-12 h-12 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-foreground mb-2">4. Execution</h3>
                <p className="text-xs text-muted-foreground">The Builder agent generates a fully coded landing page.</p>
              </div>
            </div>
          </div>
        </div>

        {/* The AI Founding Team */}
        <div className="mt-40 pt-20 border-t border-black/5">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">Meet your founding team.</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">8 specialized autonomous agents working in parallel to bring your idea to life.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AGENTS.map((agent, i) => (
              <div key={i} className="df-card p-6 bg-white/50 hover:bg-white transition-colors group cursor-default">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/5 rounded-lg text-primary group-hover:bg-primary/10 transition-colors">
                    <agent.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium text-sm text-foreground">{agent.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {agent.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/5 bg-white/50 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-muted-foreground" />
            <span className="font-semibold text-sm text-muted-foreground">craftr by Forge</span>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Brought to you by <span className="font-medium text-foreground">Project Forge</span></p>
            <p className="text-xs text-muted-foreground mt-1">© 2026 Project Forge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
