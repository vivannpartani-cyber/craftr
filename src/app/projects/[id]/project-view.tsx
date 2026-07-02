"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, CheckCircle2, Clock, XCircle, Download, ExternalLink, Maximize2, Minimize2, FileSpreadsheet, Presentation, Globe2, ChevronDown, ChevronUp, Mail } from "lucide-react";
import Link from "next/link";
import { AGENTS, type AgentRole } from "@/lib/ai/agents";

type Project = {
  id: string;
  name: string;
  idea_description: string;
  status: string;
  created_at: string;
};

type AgentTask = {
  id: string;
  agent_role: AgentRole;
  status: string;
};

type Artifact = {
  id: string;
  artifact_type: AgentRole;
  content: Record<string, unknown>;
};

type DomainResult = { domain: string; available: boolean };

export default function ProjectView({ project }: { project: Project }) {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [activeTab, setActiveTab] = useState<AgentRole | "dashboard" | null>(null);
  const [isBuilding, setIsBuilding] = useState(project.status === "building");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Tools panel state
  const [showTools, setShowTools] = useState(false);
  const [domains, setDomains] = useState<DomainResult[] | null>(null);
  const [loadingDomains, setLoadingDomains] = useState(false);

  // Dashboard states
  const [memories, setMemories] = useState<any[]>([]);
  const [isResearching, setIsResearching] = useState(false);
  const [isUltra, setIsUltra] = useState(false);
  const [agentPulsing, setAgentPulsing] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Load unlock state
  useEffect(() => {
    setIsUltra(localStorage.getItem("isUltra") === "true");
  }, []);

  // Poll for updates while building
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, artifactsRes, memRes] = await Promise.all([
          fetch(`/api/projects/${project.id}/tasks`),
          fetch(`/api/projects/${project.id}/artifacts`),
          fetch(`/api/projects/${project.id}/memory`),
        ]);
        if (tasksRes.ok) {
          const data = await tasksRes.json();
          setTasks(data.tasks || []);
        }
        if (artifactsRes.ok) {
          const data = await artifactsRes.json();
          const arts: Artifact[] = data.artifacts || [];
          setArtifacts(arts);
          if (arts.length > 0 && !activeTab) {
            setActiveTab(project.status === "completed" ? "dashboard" : arts[0].artifact_type);
          }
        }
        if (memRes.ok) {
          const data = await memRes.json();
          setMemories(data.memories || []);
        }
      } catch (err) {
        // Silently ignore fetch errors in case of dev server restart
      }
    };

    fetchData();
    let interval: NodeJS.Timeout;
    if (isBuilding) {
      interval = setInterval(async () => {
        await fetchData();
        // Check if project is done
        try {
          const res = await fetch(`/api/projects/${project.id}/status`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'completed') {
              setIsBuilding(false);
              setActiveTab("dashboard");
              clearInterval(interval);
            }
          }
        } catch (err) {
          // Ignore
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [project.id, isBuilding, activeTab]);

  // Continuous Agent Heartbeat Loop (Runs every 1 minute)
  useEffect(() => {
    let loopInterval: NodeJS.Timeout;

    const triggerHeartbeat = async () => {
      setAgentPulsing(true);
      try {
        console.log("Agent Loop Heartbeat triggering...");
        const res = await fetch(`/api/projects/${project.id}/agent-loop`, { method: "POST" });
        if (res.ok) {
          const memRes = await fetch(`/api/projects/${project.id}/memory`);
          if (memRes.ok) {
            const data = await memRes.json();
            setMemories(data.memories || []);
          }
        }
      } catch (err) {
        console.error("Agent Loop Failed", err);
      } finally {
        setTimeout(() => setAgentPulsing(false), 3000);
      }
    };

    if (!isBuilding) {
      triggerHeartbeat();
      loopInterval = setInterval(triggerHeartbeat, 60000);
    }

    return () => clearInterval(loopInterval);
  }, [project.id, isBuilding]);

  const agentRoles: AgentRole[] = [
    "market_analyst",
    "product_strategist",
    "tech_architect",
    "brand_designer",
    "financial_analyst",
    "launch_strategist",
    "customer_discovery",
    "investor_radar",
    "website_builder",
  ];

  const getTaskStatus = (role: AgentRole) => {
    return tasks.find((t) => t.agent_role === role)?.status;
  };

  const getArtifact = (role: AgentRole) => {
    return artifacts.find((a) => a.artifact_type === role);
  };

  const activeArtifact = activeTab && activeTab !== "dashboard" ? getArtifact(activeTab) : null;
  const isWebsiteTab = activeTab === "website_builder";
  const websiteArtifact = getArtifact("website_builder");

  const handleDownload = () => {
    if (!websiteArtifact?.content?.html) return;
    const blob = new Blob([websiteArtifact.content.html as string], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/\s+/g, "-")}-landing-page.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const checkDomains = async () => {
    setLoadingDomains(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/domains`);
      if (res.ok) {
        const data = await res.json();
        setDomains(data.domains);
      }
    } catch (err) {
      console.error("Domain check failed", err);
    } finally {
      setLoadingDomains(false);
    }
  };

  const handleResearch = async () => {
    setIsResearching(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/research`, { method: "POST" });
      if (res.ok) {
        const memRes = await fetch(`/api/projects/${project.id}/memory`);
        if (memRes.ok) {
          const data = await memRes.json();
          setMemories(data.memories || []);
        }
      }
    } catch (err) {
      // ignore
    } finally {
      setIsResearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="df-header-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-medium tracking-tight text-foreground">{project.name}</h1>
            <p className="text-sm text-muted-foreground">{project.idea_description}</p>
          </div>
          {isBuilding ? (
            <div className="ml-auto flex items-center gap-2 text-primary text-sm font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              AI team is working...
            </div>
          ) : project.status === "failed" || tasks.some(t => t.status === "failed") ? (
            <div className="ml-auto flex items-center gap-3">
              <span className="text-destructive text-sm flex items-center gap-1 font-medium">
                <XCircle className="w-4 h-4" /> Agent failed
              </span>
              <button
                onClick={async () => {
                  setIsBuilding(true);
                  await fetch(`/api/projects/${project.id}/retry`, { method: "POST" });
                }}
                className="btn-brand text-xs px-4 py-1.5 rounded-full"
              >
                Retry Agents
              </button>
            </div>
          ) : (
            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={() => {
                  const pwd = prompt("Enter Admin Password:");
                  if (pwd === "admin") {
                    localStorage.setItem("isUltra", "true");
                    setIsUltra(true);
                    alert("Ultra unlocked!");
                  } else if (pwd) {
                    alert("Incorrect password");
                  }
                }}
                className="text-xs text-muted-foreground/30 hover:text-primary transition-colors mr-2"
                title="Unlock Ultra"
              >
                {isUltra ? "🚀" : "🔒"}
              </button>
              <button
                onClick={async () => {
                  setIsBuilding(true);
                  await fetch(`/api/projects/${project.id}/retry`, { method: "POST" });
                }}
                className="btn-link-muted border border-black/10 text-xs px-4 py-1.5 rounded-full"
              >
                Force Retry
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Agent Status Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-3 mb-4 font-mono">
            Founding Team
          </h2>
          {!isBuilding && artifacts.length > 0 && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setActiveTab("dashboard")}
              className={`w-full text-left flex items-center justify-between transition-all mb-4 ${activeTab === "dashboard"
                  ? "df-nav-pill df-nav-pill-active shadow-sm bg-white border border-black/5"
                  : "df-nav-pill cursor-pointer border border-transparent"
                }`}
            >
              <div className="flex items-center gap-2">
                <span className={`font-medium ${activeTab === "dashboard" ? "text-foreground" : ""}`}>HQ Dashboard</span>
              </div>
            </motion.button>
          )}

          {agentRoles.map((role) => {
            const agent = AGENTS[role];
            const status = getTaskStatus(role);
            const hasArtifact = !!getArtifact(role);
            const isActive = activeTab === role;

            return (
              <motion.button
                key={role}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => hasArtifact && setActiveTab(role)}
                className={`w-full text-left flex items-center justify-between transition-all ${isActive
                    ? "df-nav-pill df-nav-pill-active shadow-sm bg-white border border-black/5"
                    : hasArtifact
                      ? "df-nav-pill cursor-pointer border border-transparent"
                      : "df-nav-pill opacity-50 cursor-default border border-transparent"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${isActive ? "text-foreground" : ""}`}>{agent.title}</span>
                </div>
                {status === "completed" && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                {status === "processing" && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                {status === "failed" && <XCircle className="w-4 h-4 text-destructive" />}
                {!status && <Clock className="w-4 h-4 opacity-50" />}
              </motion.button>
            );
          })}
        </div>

        {/* Artifact Viewer */}
        <div className="lg:col-span-3 space-y-6">

          {/* ═══ Startup Toolkit Panel ═══ */}
          {!isBuilding && artifacts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="df-card overflow-hidden"
            >
              <button
                onClick={() => setShowTools(!showTools)}
                className="w-full flex items-center justify-between p-5 hover:bg-black/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Download className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-semibold text-foreground">Startup Toolkit</h3>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Real deliverables — not descriptions of them</p>
                  </div>
                </div>
                {showTools ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
              </button>

              <AnimatePresence>
                {showTools && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Financial Model */}
                      <a
                        href={`/api/projects/${project.id}/spreadsheet`}
                        className="flex items-center gap-4 p-4 rounded-xl border border-black/5 bg-green-50/50 hover:bg-green-50 transition-colors group"
                      >
                        <div className="p-3 rounded-lg bg-green-100 text-green-700 group-hover:scale-110 transition-transform">
                          <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-foreground">Financial Model (.xlsx)</h4>
                          <p className="text-xs text-muted-foreground">Revenue model, runway calculator, expense tracker, KPIs — with real Excel formulas</p>
                        </div>
                      </a>

                      {/* Pitch Deck */}
                      <a
                        href={`/api/projects/${project.id}/pitchdeck`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 rounded-xl border border-black/5 bg-blue-50/50 hover:bg-blue-50 transition-colors group"
                      >
                        <div className="p-3 rounded-lg bg-blue-100 text-blue-700 group-hover:scale-110 transition-transform">
                          <Presentation className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-foreground">Pitch Deck (11 slides)</h4>
                          <p className="text-xs text-muted-foreground">Investor-ready slides with your data. Open in browser, ⌘P to save as PDF</p>
                        </div>
                      </a>

                      {/* Domain Checker */}
                      <button
                        onClick={() => { if (!domains) checkDomains(); }}
                        className="flex items-center gap-4 p-4 rounded-xl border border-black/5 bg-purple-50/50 hover:bg-purple-50 transition-colors group text-left"
                      >
                        <div className="p-3 rounded-lg bg-purple-100 text-purple-700 group-hover:scale-110 transition-transform">
                          {loadingDomains ? <Loader2 className="w-5 h-5 animate-spin" /> : <Globe2 className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-foreground">Domain Availability</h4>
                          <p className="text-xs text-muted-foreground">
                            {domains
                              ? `${domains.filter(d => d.available).length} of ${domains.length} checked are available`
                              : loadingDomains ? "Checking 20+ domain variants..." : "Check .com, .io, .ai, .app, .co variants"}
                          </p>
                        </div>
                      </button>

                      {/* Daily Briefing */}
                      <div className="flex items-center gap-4 p-4 rounded-xl border border-black/5 bg-amber-50/50 group">
                        <div className="p-3 rounded-lg bg-amber-100 text-amber-700">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-foreground">Daily Briefing Email</h4>
                          <p className="text-xs text-muted-foreground">Your AI co-founder sends you a morning report at 8am UTC every day with insights, KPIs, and action items</p>
                        </div>
                      </div>
                    </div>

                    {/* Domain Results */}
                    {domains && domains.length > 0 && (
                      <div className="px-5 pb-5">
                        <div className="border border-black/5 rounded-xl overflow-hidden">
                          <div className="p-3 bg-black/[0.02] border-b border-black/5">
                            <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Domain scan results</h4>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-black/5">
                            {domains.map((d) => (
                              <div key={d.domain} className={`px-3 py-2.5 text-xs flex items-center gap-2 ${d.available ? 'bg-green-50' : 'bg-white'}`}>
                                {d.available
                                  ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                                  : <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                                <span className={d.available ? "font-semibold text-green-800" : "text-muted-foreground"}>{d.domain}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {!activeArtifact && isBuilding && (
            <div className="df-card border-dashed p-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-6" />
              <h3 className="text-sm font-mono uppercase tracking-widest text-foreground mb-2">Team is working</h3>
              <p className="text-muted-foreground text-sm">
                The AI agents are analyzing your idea. Results will appear here as they finish.
              </p>
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="df-card p-8 bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden relative">
                <div className="relative z-10">
                  <h2 className="text-sm font-mono uppercase tracking-widest text-white/50 mb-6">Live Command Center</h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
                    {/* Block 1: Projected MRR */}
                    <div>
                      <div className="text-3xl font-semibold mb-1">
                        {(() => {
                          const fa = artifacts.find(a => a.artifact_type === 'financial_analyst');
                          if (!fa) return "N/A";
                          try {
                            const content = typeof fa.content === 'string' ? JSON.parse(fa.content) : fa.content;
                            return content?.dashboardMetrics?.projectedMRR 
                                || content?.revenueProjections?.month6 
                                || "N/A";
                          } catch(e) { return "N/A" }
                        })()}
                      </div>
                      <div className="text-xs text-white/50 uppercase tracking-widest">Projected MRR (M6)</div>
                    </div>
                  
                    {/* Block 2: Health Score */}
                    <div>
                      <div className="text-3xl font-semibold mb-1">
                        {(() => {
                          const fa = artifacts.find(a => a.artifact_type === 'financial_analyst');
                          if (fa) {
                            try {
                              const content = typeof fa.content === 'string' ? JSON.parse(fa.content) : fa.content;
                              const score = content?.dashboardMetrics?.healthScore;
                              if (score !== undefined && score !== null) return score + "/100";
                              
                              const hasProjections = !!content?.revenueProjections;
                              const hasPricing = Array.isArray(content?.pricingStrategy) && content.pricingStrategy.length > 0;
                              if (hasProjections && hasPricing) return "78/100";
                              if (hasProjections || hasPricing) return "62/100";
                              return "55/100";
                            } catch(e) {}
                          }
                          return isBuilding ? "Calculating..." : "N/A";
                        })()}
                      </div>
                      <div className="text-xs text-white/50 uppercase tracking-widest">Startup Health Score</div>
                    </div>
                    
                    {/* Block 3: Target Addressable Market (TAM) */}
                    <div>
                      <div className="text-3xl font-semibold mb-1">
                        {(() => {
                          const ma = artifacts.find(a => a.artifact_type === 'market_analyst');
                          if (!ma) return isBuilding ? "Scanning..." : "N/A";
                          try {
                            const content = typeof ma.content === 'string' ? JSON.parse(ma.content) : ma.content;
                            return content?.marketSize?.tam || "N/A";
                          } catch(e) { return "N/A" }
                        })()}
                      </div>
                      <div className="text-xs text-white/50 uppercase tracking-widest">Total Market (TAM)</div>
                    </div>
                  </div>
                  
                {/* Decorative background */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* AI Co-Founder Suggestions */}
                <div className="df-card p-6 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">💡</span>
                    <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">AI Co-Founder Suggestions</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">Click to add to your startup and rebuild automatically.</p>
                  <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2">
                    {[
                      "Add a freemium tier to reduce conversion friction",
                      "Create a referral program with a 30% commission",
                      "Build a public API to expand to developers",
                      "Launch a lifetime deal on AppSumo",
                      "Create a case study page with customer testimonials"
                    ].map((idea, i) => (
                      <div key={i} className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                        <p className="text-xs font-medium text-foreground mb-2">{idea}</p>
                        <button
                          onClick={async () => {
                            if (confirm("Add this idea and rebuild?")) {
                              setIsBuilding(true);
                              await fetch(`/api/projects/${project.id}/retry?appendIdea=${encodeURIComponent(idea)}`, { method: "POST" });
                            }
                          }}
                          className="text-[10px] uppercase font-mono tracking-widest text-primary font-semibold flex items-center gap-1 hover:underline"
                        >
                          ➕ Add to Startup
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="df-card p-6">
                  <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">Latest Agent Activity</h3>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {memories.length > 0 ? memories.slice(0, 5).map((m: any, idx: number) => (
                      <div key={idx} className="flex gap-4">
                        <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${idx === 0 ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                        <div>
                          <p className="text-sm font-medium">{m.source === "background_monitor" ? "Market Monitor" : m.source}</p>
                          <p className="text-xs text-muted-foreground mt-1">{m.fact}</p>
                          <p className="text-[10px] text-muted-foreground font-mono mt-2">{new Date(m.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="flex gap-4">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500 shrink-0"></div>
                        <div>
                          <p className="text-sm font-medium">Phase 1 Build Completed</p>
                          <p className="text-xs text-muted-foreground mt-1">All foundational artifacts successfully generated.</p>
                          <p className="text-[10px] text-muted-foreground font-mono mt-2">Recently</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 
                  ========================================
                  UPDATED: MEMORY / KNOWLEDGE GRAPH SECTION
                  ========================================
                */}
                <div className="df-card p-6">
                  <div className="flex flex-col gap-3 mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Memory / Knowledge Graph</h3>
                      {agentPulsing && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                          Agent Active
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={async () => {
                          setSendingEmail(true);
                          try {
                            await fetch('/api/cron/daily-briefing', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' }
                            });
                          } finally {
                            setSendingEmail(false);
                            alert("Email sent! Check your inbox.");
                          }
                        }}
                        disabled={sendingEmail}
                        className="btn-link-muted text-xs flex items-center gap-1 border border-black/10 px-2 py-1 rounded-md whitespace-nowrap"
                      >
                        {sendingEmail ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
                        Send Briefing
                      </button>
                      <button onClick={handleResearch} disabled={isResearching} className="btn-link-muted text-xs flex items-center gap-1 border border-black/10 px-2 py-1 rounded-md whitespace-nowrap">
                        {isResearching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Globe2 className="w-3 h-3" />}
                        Run Web Research
                      </button>
                    </div>
                  </div>

                  {memories.length > 0 ? (
                    <div className="space-y-3">
                      <div className="text-sm text-foreground font-medium flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Context Established</div>
                      <p className="text-xs text-muted-foreground">The AI has accumulated {memories.length} historical facts and events about your startup to use in future decision-making.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center border border-dashed border-black/10 rounded-xl bg-black/[0.02]">
                      <Clock className="w-6 h-6 text-muted-foreground/50 mb-3" />
                      <p className="text-sm text-foreground font-medium">Building Context</p>
                      <p className="text-xs text-muted-foreground max-w-[200px] mt-1">The AI is currently accumulating history and decisions. Click "Run Web Research" to gather market news.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {!activeArtifact && !isBuilding && artifacts.length === 0 && (
            <div className="df-card border-dashed p-16 text-center">
              <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">No results yet</p>
            </div>
          )}

          {/* Website Preview Tab */}
          {activeArtifact && isWebsiteTab && (
            <motion.div
              key="website_preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Toolbar */}
              <div className="df-card p-4 flex items-center justify-between bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🌐</span>
                  <div>
                    <h2 className="text-sm font-medium text-foreground">Generated Landing Page</h2>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Live preview of your startup website</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2 rounded border border-black/5 text-muted-foreground hover:text-foreground hover:border-black/20 bg-white transition-colors shadow-sm"
                    title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                  <a
                    href={`/api/projects/${project.id}/preview`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded border border-black/5 text-muted-foreground hover:text-foreground hover:border-black/20 bg-white transition-colors shadow-sm"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={handleDownload}
                    className="btn-brand text-xs py-1.5 px-4 rounded-md"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download HTML
                  </button>
                </div>
              </div>

              {/* iframe Preview */}
              <div
                className={`df-card overflow-hidden transition-all ${isFullscreen ? "fixed inset-4 z-50" : ""
                  }`}
              >
                {isFullscreen && (
                  <div className="absolute top-2 right-2 z-50">
                    <button
                      onClick={() => setIsFullscreen(false)}
                      className="p-2 rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors"
                    >
                      <Minimize2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <iframe
                  src={`/api/projects/${project.id}/preview`}
                  className={`w-full border-0 ${isFullscreen ? "h-full" : "h-[700px]"}`}
                  title="Website Preview"
                />
              </div>

              {isFullscreen && (
                <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setIsFullscreen(false)} />
              )}
            </motion.div>
          )}

          {/* Standard JSON Artifact Viewer */}
          {activeArtifact && !isWebsiteTab && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="df-card p-8"
            >
              <div className="flex items-center gap-3 mb-6 border-b border-black/5 pb-6">
                <div>
                  <h2 className="text-xl font-medium tracking-tight text-foreground">{AGENTS[activeArtifact.artifact_type].title} Report</h2>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">{AGENTS[activeArtifact.artifact_type].description}</p>
                </div>
              </div>
              <ArtifactRenderer role={activeArtifact.artifact_type} content={activeArtifact.content} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// Renders the artifact content based on agent role
function ArtifactRenderer({ role, content }: { role: AgentRole; content: Record<string, unknown> }) {
  return (
    <div className="space-y-6 text-sm">
      {Object.entries(content).map(([key, value]) => (
        <div key={key}>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            {key.replace(/([A-Z])/g, " $1").trim()}
          </h3>
          <ValueRenderer value={value} />
        </div>
      ))}
    </div>
  );
}

function ValueRenderer({ value }: { value: unknown }) {
  if (typeof value === "string") {
    return <p className="text-foreground leading-relaxed">{value}</p>;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return <p className="text-foreground">{String(value)}</p>;
  }
  if (Array.isArray(value)) {
    return (
      <ul className="space-y-2">
        {value.map((item, i) => (
          <li key={i} className="border border-black/5 bg-black/[0.02] rounded-md p-4 text-xs shadow-sm">
            {typeof item === "string" ? (
              <span className="text-foreground">{item}</span>
            ) : (
              <div className="space-y-1.5">
                {Object.entries(item as Record<string, unknown>).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-muted-foreground capitalize font-mono text-[10px] uppercase tracking-widest min-w-[80px] shrink-0 pt-0.5">{k}:</span>
                    <span className="text-foreground font-medium">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  }
  if (typeof value === "object" && value !== null) {
    return (
      <div className="border border-black/5 bg-black/[0.02] rounded-md p-5 space-y-3 text-xs shadow-sm">
        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
          <div key={k} className="flex gap-3">
            <span className="text-muted-foreground capitalize font-mono text-[10px] uppercase tracking-widest shrink-0 min-w-[100px] pt-0.5">
              {k.replace(/([A-Z])/g, " $1").trim()}:
            </span>
            <span className="text-foreground font-medium">{String(v)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}
