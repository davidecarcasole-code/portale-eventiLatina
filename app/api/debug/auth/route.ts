import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { extractToken, verifyToken, getAuthUser } = await import("@/lib/auth");
    const authHeader = req.headers.get("authorization");
    const token = extractToken(req);
    
    let decoded: any = null;
    if (token) {
      try { decoded = verifyToken(token); } catch (e: any) { decoded = { error: e.message }; }
    }

    let user: any = null;
    let userError: string | null = null;
    try {
      if (token) user = await getAuthUser(token);
    } catch (e: any) { userError = e.message; }

    return Response.json({
      hasAuthHeader: !!authHeader,
      headerPrefix: authHeader?.substring(0, 30) ?? null,
      hasToken: !!token,
      tokenLen: token?.length ?? 0,
      decoded,
      user,
      userError,
    });
  } catch (err: any) {
    return Response.json({ error: err.message, stack: err.stack?.substring(0, 300) }, { status: 500 });
  }
}
