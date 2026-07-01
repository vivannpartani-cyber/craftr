import { generateJSON } from "./gemini";
import { AGENTS, type AgentRole } from "./agents";

interface SupervisorPlan {
  plan: Array<{
    agent: AgentRole;
    task: string;
    priority: number;
  }>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function generateWithRetry<T>(
  prompt: string,
  systemPrompt: string,
  retries = 3,
  maxTokens?: number,
  customApiKey?: string
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await generateJSON<T>(prompt, systemPrompt, undefined, maxTokens, customApiKey);
    } catch (err: any) {
      const isRateLimit = err?.message?.includes("429") || err?.message?.includes("quota");
      const isJsonError = err?.message?.includes("json") || err?.message?.includes("JSON");
      
      if ((isRateLimit || isJsonError) && i < retries - 1) {
        const waitMs = isRateLimit ? (i + 1) * 20000 : 2000;
        console.log(`[Forge] Error (${isRateLimit ? 'RateLimit' : 'JSON'}). Retrying ${i + 2}/${retries} in ${waitMs}ms...`);
        await sleep(waitMs);
      } else {
        throw err;
      }
    }
  }
  throw new Error("Max retries exceeded");
}

function makeSupabaseClient(accessToken?: string) {
  // Dynamic import to avoid issues with SSR context
  const { createClient } = require('@supabase/supabase-js');
  
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const isPlaceholder = !serviceKey || serviceKey === "your-service-role-key";
  
  const clientOptions: any = {};
  if (accessToken) {
    clientOptions.global = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    isPlaceholder ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! : serviceKey,
    clientOptions
  );
}

async function saveArtifact(
  supabase: any,
  projectId: string,
  artifactType: string,
  content: Record<string, unknown>
) {
  // Delete old artifact if exists
  const { error: delErr } = await supabase
    .from("project_artifacts")
    .delete()
    .eq("project_id", projectId)
    .eq("artifact_type", artifactType);
  if (delErr) console.error("Error deleting old artifact:", delErr);

  // Insert new artifact
  const { error: insErr } = await supabase
    .from("project_artifacts")
    .insert({ project_id: projectId, artifact_type: artifactType, content });
  if (insErr) console.error("Error inserting artifact:", insErr);
}

async function updateTaskStatus(
  supabase: any,
  taskId: string,
  status: string,
  result?: Record<string, unknown>
) {
  const update: any = { status };
  if (status === "completed") {
    update.output_result = result;
    update.completed_at = new Date().toISOString();
  }
  await supabase.from("agent_tasks").update(update).eq("id", taskId);
}

export async function runForgeOrchestration(
  projectId: string,
  projectName: string,
  ideaDescription: string,
  accessToken?: string,
  customApiKey?: string
) {
  const supabase = makeSupabaseClient(accessToken);

  try {
    // Step 1: Supervisor creates the work plan
    console.log(`[Forge] Supervisor analyzing: ${projectName}`);
    const supervisorPlan = await generateWithRetry<SupervisorPlan>(
      `Startup idea: "${ideaDescription}"\nProject name: "${projectName}"\n\nCreate the work plan for the founding team.`,
      AGENTS.supervisor.systemPrompt,
      3,
      undefined,
      customApiKey
    );

    // Step 2: Run each strategy agent in priority order
    const sortedTasks = supervisorPlan.plan.sort((a, b) => a.priority - b.priority);
    const agentOutputs: Record<string, Record<string, unknown>> = {};

    for (const task of sortedTasks) {
      const agentConfig = AGENTS[task.agent];
      if (!agentConfig || task.agent === "website_builder") continue;

      console.log(`[Forge] Running: ${agentConfig.title}`);

      // Clean up old task record to prevent duplicates on retry
      await supabase.from("agent_tasks").delete().eq("project_id", projectId).eq("agent_role", task.agent);

      // Insert task record
      const { data: taskRecord } = await supabase
        .from("agent_tasks")
        .insert({
          project_id: projectId,
          agent_role: task.agent,
          status: "processing",
          input_context: { idea: ideaDescription, task: task.task },
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      try {
        const result = await generateWithRetry<Record<string, unknown>>(
          `Startup idea: "${ideaDescription}"\nProject name: "${projectName}"\n\nYour specific task: ${task.task}`,
          agentConfig.systemPrompt,
          3,
          undefined,
          customApiKey
        );

        agentOutputs[task.agent] = result;
        await saveArtifact(supabase, projectId, task.agent, result);

        if (taskRecord) {
          await updateTaskStatus(supabase, taskRecord.id, "completed", result);
        }

        console.log(`[Forge] ✓ ${agentConfig.title} done`);
      } catch (error: any) {
        console.error(`[Forge] ✗ ${agentConfig.title} failed:`, error.message);
        if (taskRecord) {
          await updateTaskStatus(supabase, taskRecord.id, "failed");
        }
      }

      // 5s pause between agents to stay within free tier rate limits
      await sleep(5000);
    }

    // Step 3: Run the Website Builder with combined context from all agents
    console.log(`[Forge] Running: Website Builder`);
    
    // Clean up old task record to prevent duplicates on retry
    await supabase.from("agent_tasks").delete().eq("project_id", projectId).eq("agent_role", "website_builder");

    const { data: websiteTask } = await supabase
      .from("agent_tasks")
      .insert({
        project_id: projectId,
        agent_role: "website_builder",
        status: "processing",
        input_context: { idea: ideaDescription },
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    try {
      // Build a rich context prompt from all prior agent outputs
      const brandData = agentOutputs["brand_designer"] || {};
      const productData = agentOutputs["product_strategist"] || {};
      const financialData = agentOutputs["financial_analyst"] || {};
      const launchData = agentOutputs["launch_strategist"] || {};
      const marketData = agentOutputs["market_analyst"] || {};

      const websitePrompt = `
Startup idea: "${ideaDescription}"
Project name: "${projectName}"

=== BRAND IDENTITY ===
${JSON.stringify(brandData, null, 2)}

=== PRODUCT FEATURES ===
${JSON.stringify(productData, null, 2)}

=== PRICING & BUSINESS MODEL ===
${JSON.stringify(financialData, null, 2)}

=== MARKET ANALYSIS ===
${JSON.stringify(marketData, null, 2)}

=== LAUNCH STRATEGY ===
${JSON.stringify(launchData, null, 2)}

Using ALL of the above data, generate a complete, stunning, production-ready landing page website.
Use the exact brand colors, fonts, product features, and pricing tiers provided.
The website must be a single self-contained HTML file with inline CSS and JS.
Make it look like a $50,000 agency-built site.
`;

      // Wait extra to avoid rate limit after the strategy agents
      await sleep(10000);

      const websiteResult = await generateWithRetry<{ html: string }>(
        websitePrompt,
        AGENTS.website_builder.systemPrompt,
        3,
        8000,
        customApiKey
      );

      await saveArtifact(supabase, projectId, "website_builder", websiteResult as Record<string, unknown>);

      if (websiteTask) {
        await updateTaskStatus(supabase, websiteTask.id, "completed", websiteResult as Record<string, unknown>);
      }

      console.log(`[Forge] ✓ Website Builder done`);
    } catch (error: any) {
      console.error(`[Forge] ✗ Website Builder failed:`, error.message);
      if (websiteTask) {
        await updateTaskStatus(supabase, websiteTask.id, "failed");
      }
    }

    await supabase.from("projects").update({ status: "completed" }).eq("id", projectId);
    console.log(`[Forge] ✓ "${projectName}" complete`);
  } catch (error: any) {
    console.error(`[Forge] Orchestration failed:`, error.message);
    await supabase.from("projects").update({ status: "failed" }).eq("id", projectId);
  }
}
