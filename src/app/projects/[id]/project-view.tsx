"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, CheckCircle2, Clock, XCircle, Download, ExternalLink, Maximize2, Minimize2 } from "lucide-react";
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

export default function ProjectView({ project }: { project: Project }) {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [activeTab, setActiveTab] = useState<AgentRole | null>(null);
  const [isBuilding, setIsBuilding] = useState(project.status === "building");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Poll for updates while building
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, artifactsRes] = await Promise.all([
          fetch(`/api/projects/${project.id}/tasks`),
          fetch(`/api/projects/${project.id}/artifacts`),
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
            setActiveTab(arts[0].artifact_type);
          }
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
              clearInterval(interval);
            }
          }
        } catch (err) {
          // Ignore
        }
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [project.id, isBuilding, activeTab]);

  const agentRoles: AgentRole[] = [
    "market_analyst",
    "product_strategist",
    "tech_architect",
    "brand_designer",
    "financial_analyst",
    "launch_strategist",
    "website_builder",
  ];

  const getTaskStatus = (role: AgentRole) => {
    return tasks.find((t) => t.agent_role === role)?.status;
  };

  const getArtifact = (role: AgentRole) => {
    return artifacts.find((a) => a.artifact_type === role);
  };

  const activeArtifact = activeTab ? getArtifact(activeTab) : null;
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
                className={`w-full text-left flex items-center justify-between transition-all ${
                  isActive
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
        <div className="lg:col-span-3">
          {!activeArtifact && isBuilding && (
            <div className="df-card border-dashed p-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-6" />
              <h3 className="text-sm font-mono uppercase tracking-widest text-foreground mb-2">Team is working</h3>
              <p className="text-muted-foreground text-sm">
                The AI agents are analyzing your idea. Results will appear here as they finish.
              </p>
            </div>
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
                className={`df-card overflow-hidden transition-all ${
                  isFullscreen ? "fixed inset-4 z-50" : ""
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
                  <h2 className="text-xl font-medium tracking-tight text-foreground">{AGENTS[activeTab!].title} Report</h2>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">{AGENTS[activeTab!].description}</p>
                </div>
              </div>
              <ArtifactRenderer role={activeTab!} content={activeArtifact.content} />
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
