import { NextRequest } from "next/server";
import { jsonResponse, handleApiError, requireAdmin } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { task } = await req.json().catch(() => ({ task: '' }));

    if (!task) return jsonResponse({ error: "Specificare 'task': classify, enrich, dedup, summarize, all" }, 400);

    const tasks: string[] = task === 'all' ? ['classify', 'enrich', 'dedup', 'summarize'] : [task];
    const results: any[] = [];

    for (const t of tasks) {
      switch (t) {
        case 'classify': {
          const { classifyAllEvents } = await import("@/lib/agent/engine");
          results.push(await classifyAllEvents());
          break;
        }
        case 'enrich': {
          const { enrichAllDescriptions } = await import("@/lib/agent/engine");
          results.push(await enrichAllDescriptions());
          break;
        }
        case 'dedup': {
          const { dedupEvents } = await import("@/lib/agent/engine");
          results.push(await dedupEvents());
          break;
        }
        case 'summarize': {
          const { summarizeEvents } = await import("@/lib/agent/engine");
          results.push(await summarizeEvents());
          break;
        }
        default:
          results.push({ task: t, processed: 0, details: `Task sconosciuto: ${t}` });
      }
    }

    return jsonResponse({ message: "Agent completato", results });
  } catch (err) { return handleApiError(err); }
}
