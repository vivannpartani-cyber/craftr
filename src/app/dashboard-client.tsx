"use client";

import { motion } from "framer-motion";
import { Plus, LayoutGrid, Settings, BrainCircuit, LogOut, Loader2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Project = {
  id: string;
  name: string;
  idea_description: string;
  status: string;
  created_at: string;
};

export default function DashboardClient({ userEmail }: { userEmail: string | null }) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectIdea, setNewProjectIdea] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Settings state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'account' | 'api'>('account');
  const [apiKey, setApiKey] = useState("");
  const [isPro, setIsPro] = useState(false);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);

  useEffect(() => {
    fetchProjects();
    const savedKey = localStorage.getItem('forge_groq_api_key');
    if (savedKey) setApiKey(savedKey);
    
    // Check if user returned from Stripe checkout
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('stripe') === 'success') {
      setIsPro(true);
      // In a real app, this should be fetched from Supabase
    }
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !newProjectIdea.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newProjectName, 
          idea: newProjectIdea,
          customApiKey: apiKey || undefined 
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setProjects([data.project, ...projects]);
        setIsModalOpen(false);
        setNewProjectName("");
        setNewProjectIdea("");
        
        // Navigate to the project view
        router.push(`/projects/${data.project.id}`);
      }
    } catch (error) {
      console.error("Failed to create project", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpgradeToPro = async () => {
    try {
      setIsLoadingCheckout(true);
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to initialize checkout.");
      }
    } catch (e) {
      console.error(e);
      alert("Error contacting payment server.");
    } finally {
      setIsLoadingCheckout(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-64 border-r border-black/5 bg-background flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
      >
        <div className="p-6 flex items-center gap-3 border-b border-black/5">
          <BrainCircuit className="w-5 h-5 text-primary" />
          <h1 className="font-semibold text-sm tracking-widest uppercase text-foreground font-mono">craftr</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Button variant="secondary" className="w-full justify-start gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80">
            <LayoutGrid className="w-4 h-4" />
            My Projects
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setIsSettingsOpen(true)}
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </nav>

        <div className="p-4 border-t border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-medium uppercase text-primary">
              {userEmail ? userEmail.charAt(0) : "U"}
            </div>
            <div className="text-sm overflow-hidden text-ellipsis whitespace-nowrap">
              <p className="font-medium text-foreground truncate">{userEmail ?? "Guest"}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {isPro ? (
                  <span className="text-primary font-medium">Pro Tier</span>
                ) : (
                  "Free Tier"
                )}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive mt-4"
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              window.location.replace("/");
            }}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </motion.aside>

      {/* Settings Modal */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[450px] bg-white border border-black/10 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-foreground font-medium tracking-tight">Account Settings</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Manage your profile, billing, and API preferences.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex border-b border-black/5 mt-4">
            <button 
              className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === 'account' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('account')}
            >
              Account & Billing
            </button>
            <button 
              className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === 'api' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('api')}
            >
              API Keys
            </button>
          </div>

          <div className="pt-4">
            {activeTab === 'account' ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email Address</label>
                  <Input 
                    value={userEmail ?? "Guest"}
                    disabled
                    className="bg-black/5 border-black/5 text-foreground rounded-lg"
                  />
                </div>
                <div className="space-y-4 p-4 border border-black/10 rounded-xl bg-black/5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-foreground text-sm">Free Tier</h4>
                      <p className="text-xs text-muted-foreground mt-1">Basic orchestration with standard models.</p>
                    </div>
                    {!isPro && (
                      <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">Current</span>
                    )}
                  </div>
                  <div className="pt-4 border-t border-black/10">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h4 className="font-medium text-foreground text-sm flex items-center gap-2">
                          Craftr Pro 
                          {isPro && <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">Active</span>}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">Premium models and unlimited projects.</p>
                      </div>
                    </div>
                    {!isPro && (
                      <div className="mt-4 flex items-center justify-between bg-white p-3 rounded-lg border border-black/5">
                        <p className="text-xs text-muted-foreground">
                          Unlock premium generation speeds and unlimited projects.
                        </p>
                        <Button 
                          size="sm" 
                          className="btn-brand h-8"
                          disabled={isLoadingCheckout}
                          onClick={handleUpgradeToPro}
                        >
                          {isLoadingCheckout ? "Loading..." : "Upgrade to Pro"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">API Key</label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Bypass limits by providing your own API key. <span className="text-red-500 font-medium">Warning:</span> Each use takes up about 9.5k tokens so most free tier APIs won't work. We recommend <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">console.groq.com</a> for API keys with higher token rates.
                  </p>
                  <Input 
                    type="password"
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      localStorage.setItem('forge_groq_api_key', e.target.value);
                    }}
                    placeholder="sk-..., gsk_..., etc." 
                    className="bg-background border-black/10 text-foreground rounded-lg focus-visible:ring-primary/50"
                  />
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Your key is stored locally in your browser and automatically routes to the correct provider (OpenAI, Anthropic, Google, or Groq) based on the format.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="pt-4 flex justify-end border-t border-black/5 mt-6">
            <Button type="button" onClick={() => setIsSettingsOpen(false)} className="btn-brand rounded-full px-6">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto bg-background">
        {/* Decorative Vision background elements */}
        <div className="absolute top-0 inset-x-0 h-[30vh] bg-gradient-to-b from-white to-transparent opacity-50 pointer-events-none" />
        
        <div className="p-8 max-w-5xl mx-auto space-y-12 relative z-10 pt-4">
          <header className="flex justify-between items-center pb-6 df-header-blur sticky top-0 px-8 -mx-8 pt-8 z-30">
            <div>
              <h2 className="text-3xl font-medium tracking-tight text-foreground flex gap-1.5">
                <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>Welcome</motion.span>
                <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>back</motion.span>
              </h2>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-muted-foreground font-mono text-xs mt-2 uppercase tracking-wider">
                Ready to build your next startup?
              </motion.p>
            </div>
            
            <Button size="sm" onClick={() => setIsModalOpen(true)} className="gap-2 rounded-full btn-brand text-sm shadow-md">
              <Plus className="w-4 h-4" />
              New Project
            </Button>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogContent className="sm:max-w-[500px] bg-white border border-black/10 shadow-2xl rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-foreground font-medium tracking-tight">Create New Startup</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Give us a name and a one-sentence pitch to ignite the founding team.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateProject} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Project Name</label>
                    <Input 
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="e.g. Acme AI" 
                      required
                      className="bg-background border-black/10 text-foreground rounded-lg focus-visible:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">The Idea</label>
                    <Textarea 
                      value={newProjectIdea}
                      onChange={(e) => setNewProjectIdea(e.target.value)}
                      placeholder="An AI-powered bookkeeping SaaS for solo founders..." 
                      required
                      rows={4}
                      className="bg-background border-black/10 text-foreground resize-none rounded-lg focus-visible:ring-primary/50"
                    />
                  </div>
                  
                  <div className="pt-4 flex gap-3 justify-end">
                    <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-full">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="btn-brand rounded-full px-6">
                      {isSubmitting ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Igniting...</>
                      ) : (
                        "Launch Startup"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            
          </header>

          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : projects.length === 0 ? (
            /* Empty State */
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="df-card border-dashed p-12 text-center flex flex-col items-center justify-center min-h-[300px] mt-12"
            >
              <div className="w-12 h-12 flex items-center justify-center mb-4 bg-primary/5 rounded-full">
                <BrainCircuit className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-sm font-medium mb-2 text-foreground uppercase tracking-widest font-mono">No projects found</h3>
              <p className="text-muted-foreground max-w-sm mb-6 text-sm">
                Describe your business idea in a single sentence and let our AI founding team build it for you.
              </p>
              <Button size="sm" onClick={() => setIsModalOpen(true)} className="btn-brand rounded-full px-6">
                <Plus className="w-4 h-4 mr-2" />
                Launch Startup
              </Button>
            </motion.div>
          ) : (
            /* Projects Grid */
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className="group relative block df-card p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-primary/20 transition-all duration-300 cursor-pointer"
                >
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <BrainCircuit className="w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
                        <span
                          className={`text-[10px] font-mono tracking-widest uppercase px-2 py-1 rounded-full border ${
                            project.status === "completed"
                              ? "bg-green-50 border-green-200 text-green-700"
                              : project.status === "failed"
                              ? "bg-red-50 border-red-200 text-red-700"
                              : "bg-blue-50 border-blue-200 text-primary"
                          }`}
                        >
                          {project.status === "completed" ? "Ready" : project.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2 group-hover:text-primary transition-colors">{project.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.idea_description}
                      </p>
                    </div>
                  </div>
                  <div className="relative z-10 flex justify-between items-center mt-6 pt-4 border-t border-black/5">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (confirm("Are you sure you want to delete this project?")) {
                          await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
                          setProjects(projects.filter(p => p.id !== project.id));
                        }
                      }}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors z-20"
                      title="Delete project"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
