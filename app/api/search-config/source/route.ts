import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse, handleApiError, requireAdmin } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    if (!body.name || !body.url) return errorResponse("Nome e URL richiesti");
    const config = await prisma.searchConfig.findFirst({ where: { name: "default" } });
    const source = await prisma.scrapedSource.create({
      data: {
        name: body.name,
        url: body.url,
        type: body.type || "html",
        isActive: body.is_active !== false,
        selectors: body.selectors,
        city: body.city,
        province: body.province,
        categoryId: body.category_id ? parseInt(body.category_id) : null,
        configId: config?.id || null,
      },
    });
    return jsonResponse(source, 201);
  } catch (err) { return handleApiError(err); }
}
