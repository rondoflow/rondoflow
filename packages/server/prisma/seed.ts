import { PrismaClient } from "@prisma/client";
import { FACILITATOR_PRESETS } from "@rondoflow/catalog";
import { getAuth, initAuth } from "../src/auth/auth";

const prisma = new PrismaClient();

/**
 * Invite-only bootstrap: create the first admin from env so the instance is
 * manageable on a fresh DB (open self-registration is disabled). Idempotent —
 * re-running ensures the account exists and carries the admin role. The
 * server-side createUser call (no request/headers) bypasses the admin-session
 * check and also creates the hashed credential so the admin can log in.
 */
async function seedBootstrapAdmin(): Promise<void> {
  const email = process.env.RONDOFLOW_ADMIN_EMAIL;
  const password = process.env.RONDOFLOW_ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("  Bootstrap admin: skipped (set RONDOFLOW_ADMIN_EMAIL + RONDOFLOW_ADMIN_PASSWORD)");
    return;
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== "admin") {
      await prisma.user.update({ where: { email }, data: { role: "admin" } });
    }
    console.log(`  Bootstrap admin: ${email} (already exists)`);
    return;
  }
  initAuth();
  try {
    await getAuth().api.createUser({
      body: {
        email,
        password,
        name: process.env.RONDOFLOW_ADMIN_NAME ?? "Administrator",
        role: "admin",
      },
    });
    console.log(`  Bootstrap admin: created ${email}`);
  } catch (error) {
    console.warn("  Bootstrap admin: createUser failed", error);
  }
}

const WORKSPACE_ID = "a0000000-0000-0000-0000-000000000001";
const CANVAS_LAYOUT_ID = "b0000000-0000-0000-0000-000000000001";

const AGENT_IDS = {
  codeReviewer: "c0000000-0000-0000-0000-000000000001",
  contentWriter: "c0000000-0000-0000-0000-000000000002",
  researchAssistant: "c0000000-0000-0000-0000-000000000003",
} as const;

const POLICY_ID = "d0000000-0000-0000-0000-000000000001";

async function main(): Promise<void> {
  console.log("Seeding database...");

  // 0. Bootstrap admin (invite-only): ensure a manageable admin exists.
  await seedBootstrapAdmin();

  // 1. Default Workspace with canvas layout
  const workspace = await prisma.workspace.upsert({
    where: { id: WORKSPACE_ID },
    update: { name: "My Workspace" },
    create: {
      id: WORKSPACE_ID,
      name: "My Workspace",
      canvasLayouts: {
        create: {
          id: CANVAS_LAYOUT_ID,
          name: "default",
          nodes: [],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        },
      },
    },
  });
  console.log(`  Workspace: ${workspace.name}`);

  // Ensure canvas layout exists (for re-runs where workspace already existed)
  await prisma.canvasLayout.upsert({
    where: { id: CANVAS_LAYOUT_ID },
    update: {},
    create: {
      id: CANVAS_LAYOUT_ID,
      name: "default",
      workspaceId: WORKSPACE_ID,
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    },
  });

  // 2. Sample Agents
  const agents = [
    {
      id: AGENT_IDS.codeReviewer,
      name: "Code Reviewer",
      persona: "Reviews code for quality, bugs, and best practices.",
      purpose: "review",
      model: "opus",
      scope: [],
      allowedTools: ["Read", "Grep", "Glob"],
    },
    {
      id: AGENT_IDS.contentWriter,
      name: "Content Writer",
      persona: "Writes blog posts, emails, and documentation.",
      purpose: "writing",
      model: "sonnet",
      scope: [],
      allowedTools: ["Read", "Write", "Edit"],
    },
    {
      id: AGENT_IDS.researchAssistant,
      name: "Research Assistant",
      persona: "Researches topics, summarizes findings.",
      purpose: "research",
      model: "sonnet",
      scope: [],
      allowedTools: ["Read", "WebSearch", "WebFetch"],
    },
  ] as const;

  for (const agent of agents) {
    const result = await prisma.agent.upsert({
      where: { id: agent.id },
      update: {
        name: agent.name,
        persona: agent.persona,
        purpose: agent.purpose,
        model: agent.model,
        scope: [...agent.scope],
        allowedTools: [...agent.allowedTools],
      },
      create: {
        id: agent.id,
        name: agent.name,
        persona: agent.persona,
        purpose: agent.purpose,
        model: agent.model,
        scope: [...agent.scope],
        allowedTools: [...agent.allowedTools],
      },
    });
    console.log(`  Agent: ${result.name}`);
  }

  // 2b. Predefined Facilitators (global moderators — userId null, so they are
  // available out of the box to every user via the `userId: null` list query).
  // Keyed by the catalog's deterministic seedId so re-runs update in place.
  for (const preset of FACILITATOR_PRESETS) {
    const result = await prisma.agent.upsert({
      where: { id: preset.seedId },
      update: {
        name: preset.name,
        description: preset.description,
        persona: preset.persona,
        purpose: "general",
        model: preset.model,
        isFacilitator: true,
        scope: [],
        allowedTools: [],
      },
      create: {
        id: preset.seedId,
        name: preset.name,
        description: preset.description,
        persona: preset.persona,
        purpose: "general",
        model: preset.model,
        isFacilitator: true,
        scope: [],
        allowedTools: [],
      },
    });
    console.log(`  Facilitator: ${result.name}`);
  }

  // 3. Global Policy
  const policy = await prisma.policy.upsert({
    where: { id: POLICY_ID },
    update: {
      name: "Default Safety Rules",
      level: "global",
      rules: {
        blockedCommands: ["rm -rf /", "DROP TABLE", "FORMAT"],
        requireApproval: ["rm", "git push", "npm publish", "docker rm"],
        maxTimeout: 300,
        maxBudgetUsd: 1.0,
        permissionMode: "default",
      },
    },
    create: {
      id: POLICY_ID,
      name: "Default Safety Rules",
      level: "global",
      rules: {
        blockedCommands: ["rm -rf /", "DROP TABLE", "FORMAT"],
        requireApproval: ["rm", "git push", "npm publish", "docker rm"],
        maxTimeout: 300,
        maxBudgetUsd: 1.0,
        permissionMode: "default",
      },
    },
  });
  console.log(`  Policy: ${policy.name}`);

  // Built-in skills are NOT seeded. They install lazily — a catalog skill is
  // materialized (DB row + SKILL.md on disk) only when first attached/imported,
  // and the prompt builder falls back to the in-memory SKILL_CATALOG by name at
  // run time. Seeding them with placeholder paths would create duplicate rows.

  console.log("Seeding complete.");
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
