import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { extractToken, verifyToken } = await import("@/lib/auth");
    const authHeader = req.headers.get("authorization");
    const token = extractToken(req);
    
    let decoded: any = null;
    if (token) {
      decoded = verifyToken(token);
    }

    let user: any = null;
    let userError: string | null = null;
    try {
      if (token) {
        const { getAuthUser } = await import("@/lib/auth");
        user = await getAuthUser(token);
      }
    } catch (e: any) { userError = e.message; }

    return Response.json({
      hasAuthHeader: !!authHeader,
      headerPrefix: authHeader?.substring(0, 20) ?? null,
      hasToken: !!token,
      tokenLen: token?.length ?? 0,
      decoded,
      user,
      userError,
    });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
